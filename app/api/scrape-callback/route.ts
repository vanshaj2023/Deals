import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.model';
import TrackedProduct from '@/lib/models/tracked-product.model';
import ScrapeJob from '@/lib/models/scrape-job.model';
import { getLowestPrice, getHighestPrice, getAveragePrice } from '@/lib/utils';
import { dispatchAlertsForProduct } from '@/lib/alerts/dispatch';
import { cacheSet, normalizeUrl } from '@/lib/url-cache';
import type { PriceHistoryItem } from '@/types';

export const maxDuration = 59;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function verifyAuth(req: NextRequest, bodyText: string): Promise<boolean> {
  const secret = process.env.SCRAPE_SECRET || process.env.QUEUE_SECRET;
  if (!secret) return true; // dev: no secret required

  // 1. Check direct headers first (for simplicity/fallback)
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const scrapeSecretHeader = req.headers.get('x-scrape-secret');
  const queueSecretHeader = req.headers.get('x-queue-secret');

  if (
    bearerToken === secret ||
    scrapeSecretHeader === secret ||
    queueSecretHeader === secret
  ) {
    return true;
  }

  // 2. Signature verification (HMAC-SHA256)
  const signature = req.headers.get('x-signature');
  if (!signature) return false;

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    const isAuthorized = await verifyAuth(req, bodyText);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const {
      url,
      title,
      currentPrice,
      originalPrice,
      currency,
      image,
      category,
      stars,
      reviewsCount,
      isOutOfStock,
      discountRate,
      description,
      summary,
    } = payload;

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    await connectToDB();

    const normalizedUrl = normalizeUrl(url);
    let product = await Product.findOne({ url: { $in: [url, normalizedUrl] } });
    let previousPrice: number | null = null;
    let isNewProduct = false;

    if (!product) {
      // Validate critical fields before creating
      if (!currentPrice || currentPrice <= 0) {
        return NextResponse.json({ error: 'Invalid scrape: missing/zero price' }, { status: 422 });
      }
      if (!title) {
        return NextResponse.json({ error: 'Invalid scrape: missing title' }, { status: 422 });
      }

      // New product from queue — create it and promote pending trackings
      isNewProduct = true;
      const priceHistory: PriceHistoryItem[] = [{ price: currentPrice, date: new Date() }];
      const source = payload.source ?? 'amazon';
      product = await Product.create({
        url: normalizedUrl,
        source,
        title,
        currentPrice,
        originalPrice: originalPrice || currentPrice,
        currency: currency || '₹',
        image: image || 'https://via.placeholder.com/300x300?text=No+Image',
        category: category || 'General',
        stars: stars || 0,
        reviewsCount: reviewsCount || 0,
        isOutOfStock: isOutOfStock ?? false,
        discountRate: discountRate || 0,
        description: description || '',
        summary: summary ?? null,
        priceHistory,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice,
      });

      // Warm the URL cache
      cacheSet(normalizedUrl, String(product._id));

      // Promote all pending trackings for this URL to active
      const pendingTrackings = await TrackedProduct.find({
        pendingUrl: normalizedUrl,
        status: 'pending',
      });

      await Promise.all(
        pendingTrackings.map((t) =>
          TrackedProduct.findByIdAndUpdate(t._id, {
            productId: product!._id,
            status: 'active',
            pendingUrl: null,
            scrapeJobId: null,
            targetPrice: t.targetPrice ?? Math.round(currentPrice * 0.9),
          })
        )
      );

      // Mark ScrapeJob as done
      await ScrapeJob.findOneAndUpdate(
        { url: normalizedUrl },
        { status: 'done', productId: product._id }
      );
    } else {
      // Existing product — update price history
      previousPrice = product.currentPrice;
      const updatedPriceHistory: PriceHistoryItem[] = [
        ...product.priceHistory,
        { price: currentPrice, date: new Date() },
      ];

      const updateFields: Record<string, unknown> = {
        title,
        currentPrice,
        originalPrice,
        currency,
        image,
        category,
        stars,
        reviewsCount,
        isOutOfStock,
        discountRate,
        description,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };

      if (summary !== undefined) updateFields.summary = summary;

      product = await Product.findOneAndUpdate(
        { _id: product._id },
        updateFields,
        { new: true }
      );
    }

    if (product && !isNewProduct && previousPrice !== null) {
      await dispatchAlertsForProduct(
        JSON.parse(JSON.stringify(product)),
        previousPrice
      );
    }

    return NextResponse.json({
      message: isNewProduct ? 'New product created and trackings promoted' : 'Scrape callback processed successfully',
      productId: product?._id,
      previousPrice,
      currentPrice,
      isNewProduct,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
