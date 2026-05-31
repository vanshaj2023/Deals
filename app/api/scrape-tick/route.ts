import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import TrackedProduct from '@/lib/models/tracked-product.model';
import Product from '@/lib/models/product.model';
import ScrapeJob from '@/lib/models/scrape-job.model';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCRAPE_SECRET || process.env.QUEUE_SECRET;
  if (!secret) return true; // dev: no secret required
  
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const scrapeSecretHeader = req.headers.get('x-scrape-secret');
  const queueSecretHeader = req.headers.get('x-queue-secret');
  
  return (
    bearerToken === secret ||
    scrapeSecretHeader === secret ||
    queueSecretHeader === secret
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const index = parseInt(searchParams.get('index') || '0', 10);
    const total = parseInt(searchParams.get('total') || '1', 10);

    if (isNaN(index) || isNaN(total) || total < 1 || index < 0 || index >= total) {
      return NextResponse.json({ error: 'Invalid index or total parameters' }, { status: 400 });
    }

    await connectToDB();

    // Fetch all active, non-paused trackings
    const activeTrackings = await TrackedProduct.find({
      status: 'active',
      paused: { $ne: true },
    }).lean();

    // Get unique product IDs from active trackings
    const productIds = Array.from(
      new Set(
        activeTrackings
          .map((t) => t.productId?.toString())
          .filter(Boolean)
      )
    );

    // Fetch existing products
    const existingProducts = productIds.length
      ? await Product.find({ _id: { $in: productIds } }).select('_id url').lean()
      : [];

    // Fetch pending ScrapeJobs (new URLs not yet scraped)
    const pendingJobs = await ScrapeJob.find({ status: 'pending' }).select('_id url').lean() as Array<{ _id: unknown; url: string }>;

    // Combine: existing products + new queue items (deduplicate by URL)
    const existingProducts2 = existingProducts as Array<{ _id: unknown; url: string }>;
    const existingUrls = new Set(existingProducts2.map((p) => p.url));
    const newItems = pendingJobs
      .filter((j) => !existingUrls.has(j.url))
      .map((j) => ({ id: String(j._id), url: j.url, isNew: true }));

    const allItems = [
      ...existingProducts2.map((p) => ({ id: String(p._id), url: p.url, isNew: false })),
      ...newItems,
    ];

    if (!allItems.length) {
      return NextResponse.json([]);
    }

    // Partition across matrix runners
    const partitioned = allItems.filter((_, idx) => idx % total === index);

    return NextResponse.json(partitioned);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Let's support POST too for flexibility
  return GET(req);
}
