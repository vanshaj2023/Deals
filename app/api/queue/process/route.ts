import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import ScrapeJob from '@/lib/models/scrape-job.model';
import Product from '@/lib/models/product.model';
import TrackedProduct from '@/lib/models/tracked-product.model';
import User from '@/lib/models/user.model';
import { scrapeProduct } from '@/lib/scraper-client';
import { getLowestPrice, getHighestPrice, getAveragePrice } from '@/lib/utils';
import { sendEmailAlert } from '@/lib/alerts/email';
import { cacheSet, normalizeUrl } from '@/lib/url-cache';
import type { PriceHistoryItem } from '@/types';

// Simple shared secret so this endpoint isn't publicly callable.
// Set QUEUE_SECRET in .env (same value used when calling this route).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.QUEUE_SECRET;
  if (!secret) return true; // dev: no secret required
  return req.headers.get('x-queue-secret') === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDB();

  // Atomically claim one pending job — prevents two concurrent workers racing
  const job = await ScrapeJob.findOneAndUpdate(
    { status: 'pending' },
    { status: 'processing', attemptedAt: new Date() },
    { sort: { createdAt: 1 }, new: true }
  );

  if (!job) {
    return NextResponse.json({ message: 'No pending jobs' });
  }

  try {
    const normalizedUrl = normalizeUrl(job.url);

    // Check if product already exists (e.g. another worker beat us to the same URL)
    let product = await Product.findOne({ url: { $in: [job.url, normalizedUrl] } });

    if (!product) {
      const existingForSummary = null; // fresh scrape always
      const scraped = await scrapeProduct(job.url, {
        wantSummary: !existingForSummary,
        timeoutMs: 30_000,
      });

      if (!scraped) {
        await ScrapeJob.findByIdAndUpdate(job._id, {
          status: 'failed',
          error: 'Scraper returned null',
        });
        // Leave TrackedProducts in pending state; user can retry
        return NextResponse.json({ error: 'Scrape failed', jobId: job._id }, { status: 502 });
      }

      const priceHistory: PriceHistoryItem[] = [
        { price: scraped.currentPrice, date: new Date() },
      ];

      product = await Product.create({
        ...scraped,
        priceHistory,
        lowestPrice:   getLowestPrice(priceHistory),
        highestPrice:  getHighestPrice(priceHistory),
        averagePrice:  getAveragePrice(priceHistory),
      });
    } else {
      // Product existed — append a fresh price point
      const updatedHistory: PriceHistoryItem[] = [
        ...product.priceHistory,
        { price: product.currentPrice, date: new Date() },
      ];
      await Product.findByIdAndUpdate(product._id, {
        lowestPrice:   getLowestPrice(updatedHistory),
        highestPrice:  getHighestPrice(updatedHistory),
        averagePrice:  getAveragePrice(updatedHistory),
        priceHistory:  updatedHistory,
      });
    }

    // Populate LRU cache
    cacheSet(normalizedUrl, String(product._id));

    // Promote all pending TrackedProducts that were waiting on this job
    const pendingTrackings = await TrackedProduct.find({ scrapeJobId: job._id });

    for (const tracking of pendingTrackings) {
      // If user already has an active tracking for this product, delete the pending dupe
      const conflict = await TrackedProduct.findOne({
        userId: tracking.userId,
        productId: product._id,
        status: 'active',
      });

      if (conflict) {
        await TrackedProduct.findByIdAndDelete(tracking._id);
        continue;
      }

      await TrackedProduct.findByIdAndUpdate(tracking._id, {
        productId: product._id,
        status: 'active',
        scrapeJobId: null,
        pendingUrl: null,
        // Default target price if not set: 10% below current
        targetPrice:
          tracking.targetPrice ??
          Math.round(product.currentPrice * 0.9),
      });

      // Send welcome email
      const user = await User.findById(tracking.userId).lean() as { email: string } | null;
      if (user) {
        await sendEmailAlert(
          user.email,
          { title: product.title, url: product.url },
          'WELCOME'
        ).catch(() => {}); // non-blocking
      }
    }

    // Mark job done
    await ScrapeJob.findByIdAndUpdate(job._id, {
      status: 'done',
      productId: product._id,
    });

    return NextResponse.json({
      message: 'Job processed',
      jobId: job._id,
      productId: product._id,
      promoted: pendingTrackings.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await ScrapeJob.findByIdAndUpdate(job._id, { status: 'failed', error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
