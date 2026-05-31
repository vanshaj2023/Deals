const LRU = require('lru-cache') as new (opts: { max: number; maxAge: number }) => {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  del(key: string): void;
  has(key: string): boolean;
};

// Maps normalized product URL → MongoDB Product _id string.
// Shared across requests in the same Node.js process (server-side singleton).
// maxAge: 2 hours in ms
const urlCache = new LRU({ max: 500, maxAge: 1000 * 60 * 60 * 2 });

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    // Lowercase only the hostname — paths (Amazon ASINs etc.) are case-sensitive.
    u.hostname = u.hostname.toLowerCase();
    ['ref', 'tag', 'linkCode', 'linkId', 'th', 'psc', 'smid'].forEach((p) =>
      u.searchParams.delete(p)
    );
    return u.toString();
  } catch {
    return url.trim();
  }
}

export function cacheGet(url: string): string | undefined {
  return urlCache.get(url);
}

export function cacheSet(url: string, productId: string): void {
  urlCache.set(url, productId);
}

export function cacheDel(url: string): void {
  urlCache.del(url);
}

export default urlCache;
