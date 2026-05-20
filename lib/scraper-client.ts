import type { Product } from '@/types';

type ScrapeResponse = {
  source: string;
  url: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  image: string;
  category: string;
  stars: number;
  reviewsCount: number;
  isOutOfStock: boolean;
  discountRate: number;
  description: string;
  summary?: string | null;
  scrapedAt: string;
};

// SCRAPER_POOL is a comma-separated list of scraper base URLs, tried in order.
// Falls through to the next node on timeout or 5xx.
// Example: https://home.scraper.example.com,https://ec2.scraper.example.com
function getPool(): string[] {
  const pool = process.env.SCRAPER_POOL ?? process.env.SCRAPER_URL ?? '';
  return pool
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

async function tryNode(
  baseUrl: string,
  url: string,
  wantSummary: boolean,
  timeoutMs: number
): Promise<ScrapeResponse | null> {
  const token = process.env.SCRAPER_BEARER_TOKEN;
  if (!token) throw new Error('SCRAPER_BEARER_TOKEN is not set');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, want_summary: wantSummary }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    return (await res.json()) as ScrapeResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function scrapeProduct(
  url: string,
  options: { wantSummary?: boolean; timeoutMs?: number } = {}
): Promise<Omit<Product, '_id' | 'createdAt'> | null> {
  const { wantSummary = false, timeoutMs = 10_000 } = options;
  const pool = getPool();

  if (!pool.length) {
    throw new Error('No scraper nodes configured. Set SCRAPER_POOL or SCRAPER_URL.');
  }

  for (const node of pool) {
    const data = await tryNode(node, url, wantSummary, timeoutMs);
    if (!data) continue;

    return {
      url: data.url,
      title: data.title,
      currentPrice: data.currentPrice,
      originalPrice: data.originalPrice,
      currency: data.currency,
      image: data.image,
      category: data.category,
      stars: data.stars,
      reviewsCount: data.reviewsCount,
      isOutOfStock: data.isOutOfStock,
      discountRate: data.discountRate,
      description: data.description,
      summary: data.summary ?? undefined,
      source: data.source as Product['source'],
      priceHistory: [],
      lowestPrice: data.currentPrice,
      highestPrice: data.originalPrice || data.currentPrice,
      averagePrice: data.currentPrice,
    };
  }

  return null;
}

export async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok: boolean };
    return body.ok === true;
  } catch {
    return false;
  }
}
