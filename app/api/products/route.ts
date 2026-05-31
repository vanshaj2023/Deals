import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.model';
import TrackedProduct from '@/lib/models/tracked-product.model';
import ScrapeJob from '@/lib/models/scrape-job.model';
import { cacheGet, cacheSet, cacheDel, normalizeUrl } from '@/lib/url-cache';

// ── GET /api/products ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();

    const trackings = await TrackedProduct.find({ userId: session.user.id })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean();

    const data = trackings.map((t) => ({
      _id:             t._id,
      status:          t.status ?? 'active',
      pendingUrl:      t.pendingUrl ?? null,
      targetPrice:     t.targetPrice,
      thresholdPercent: t.thresholdPercent,
      paused:          t.paused,
      channelOverride: t.channelOverride,
      createdAt:       t.createdAt,
      product:         t.productId ?? null,
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error('[GET /api/products] ERROR:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST /api/products ───────────────────────────────────────────────────────
// Queue-aware flow:
//  1. LRU cache hit  → product already scraped → create TrackedProduct immediately
//  2. DB hit         → product in DB → warm cache + create TrackedProduct immediately
//  3. Job exists     → URL already queued by another user → attach to same job, return 202
//  4. No job         → create ScrapeJob + TrackedProduct(pending), fire worker, return 202
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    url: string;
    targetPrice?: number;
    thresholdPercent?: number;
  };

  if (!body.url?.trim()) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(body.url);

  try {
    await connectToDB();

    type LeanProduct = { _id: unknown; currentPrice: number; [k: string]: unknown };

    // ── 1. LRU cache hit ──────────────────────────────────────────────────
    const cachedProductId = cacheGet(normalizedUrl);
    if (cachedProductId) {
      const product = await Product.findById(cachedProductId).lean() as LeanProduct | null;
      if (product) {
        const tracking = await createActiveTracking(
          session.user.id,
          String(product._id),
          body.targetPrice ?? Math.round(product.currentPrice * 0.9),
          body.thresholdPercent
        );
        if (!tracking) {
          return NextResponse.json(
            { error: 'You are already tracking this product' },
            { status: 409 }
          );
        }
        return NextResponse.json({ data: { tracking, product, queued: false } }, { status: 201 });
      }
      cacheDel(normalizedUrl); // stale entry
    }

    // ── 2. DB hit ─────────────────────────────────────────────────────────
    const existingProduct = await Product.findOne({
      url: { $in: [body.url.trim(), normalizedUrl] },
    }).lean() as LeanProduct | null;

    if (existingProduct) {
      cacheSet(normalizedUrl, String(existingProduct._id));
      const tracking = await createActiveTracking(
        session.user.id,
        String(existingProduct._id),
        body.targetPrice ?? Math.round(existingProduct.currentPrice * 0.9),
        body.thresholdPercent
      );
      if (!tracking) {
        return NextResponse.json(
          { error: 'You are already tracking this product' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { data: { tracking, product: existingProduct, queued: false } },
        { status: 201 }
      );
    }

    // ── 3 & 4. Queue path ─────────────────────────────────────────────────
    // Check if a duplicate user request for the same URL
    const existingTracking = await TrackedProduct.findOne({
      userId: session.user.id,
      pendingUrl: normalizedUrl,
    }).lean();
    if (existingTracking) {
      return NextResponse.json(
        { error: 'This product is already in your queue' },
        { status: 409 }
      );
    }

    // Find or create the ScrapeJob for this URL
    let job = await ScrapeJob.findOne({
      url: normalizedUrl,
      status: { $in: ['pending', 'processing'] },
    });

    if (!job) {
      job = await ScrapeJob.create({ url: normalizedUrl, status: 'pending' });
    }

    // Create a pending TrackedProduct that will be promoted when the worker runs
    const pendingTracking = await TrackedProduct.create({
      userId:          session.user.id,
      productId:       null,
      scrapeJobId:     job._id,
      status:          'pending',
      pendingUrl:      normalizedUrl,
      targetPrice:     body.targetPrice ?? null,
      thresholdPercent: body.thresholdPercent ?? null,
      paused:          false,
    });

    // Fire-and-forget: trigger the worker so it runs in the background.
    // We don't await — the response goes back to the user immediately.
    triggerWorker().catch(() => {});

    return NextResponse.json(
      {
        data: {
          tracking: pendingTracking,
          product: null,
          queued: true,
          message: 'Your product is in the scraping queue. We\'ll alert you once it\'s ready and when the price hits your target.',
        },
      },
      { status: 202 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createActiveTracking(
  userId: string,
  productId: string,
  targetPrice: number,
  thresholdPercent?: number
) {
  try {
    return await TrackedProduct.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        productId,
        status: 'active',
        targetPrice,
        thresholdPercent: thresholdPercent ?? null,
        paused: false,
        scrapeJobId: null,
        pendingUrl: null,
      },
      { upsert: true, new: true }
    );
  } catch (err: unknown) {
    // Duplicate key = user already tracking this product
    if ((err as { code?: number }).code === 11000) return null;
    throw err;
  }
}

async function triggerWorker() {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const secret = process.env.QUEUE_SECRET ?? '';
  await fetch(`${base}/api/queue/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-queue-secret': secret,
    },
  });
}
