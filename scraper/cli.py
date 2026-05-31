import asyncio
import argparse
import sys
import os
import json
import hmac
import hashlib
from datetime import datetime, timezone

# Ensure the local app directory is in the import path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import httpx
from app.adapters.amazon import AmazonAdapter
from app.adapters.myntra import MyntraAdapter
from app.adapters.flipkart import FlipkartAdapter
from app.models import ScrapeResult

ADAPTERS = [AmazonAdapter(), MyntraAdapter(), FlipkartAdapter()]

def get_adapter(url: str):
    for adapter in ADAPTERS:
        if adapter.can_handle(url):
            return adapter
    return None

async def fetch_urls(backend_url: str, index: int, total: int, secret: str) -> list[dict]:
    """Fetch assigned urls to scrape from the Next.js backend."""
    print(f"Fetching URLs for matrix partition (index={index}, total={total}) from {backend_url}...")
    headers = {
        "x-scrape-secret": secret,
        "x-queue-secret": secret,
        "Authorization": f"Bearer {secret}",
    }
    
    url = f"{backend_url.rstrip('/')}/api/scrape-tick?index={index}&total={total}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 403:
                print("Error: Backend returned 403 Forbidden. Check your SCRAPE_SECRET / QUEUE_SECRET.")
                sys.exit(1)
            resp.raise_for_status()
            products = resp.json()
            print(f"Successfully fetched {len(products)} products for this partition.")
            return products
        except Exception as exc:
            print(f"Error fetching URLs from backend: {exc}")
            sys.exit(1)

async def post_result(backend_url: str, result: dict, secret: str):
    """HMAC-sign and POST the scrape results back to the Next.js backend."""
    url = f"{backend_url.rstrip('/')}/api/scrape-callback"
    
    # Serialize to compact JSON to ensure byte-perfect matching
    payload_str = json.dumps(result, separators=(',', ':'))
    payload_bytes = payload_str.encode('utf-8')
    
    # Compute signature
    signature = hmac.new(
        secret.encode('utf-8'),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "x-signature": signature,
        "x-scrape-secret": secret,
        "x-queue-secret": secret,
        "Authorization": f"Bearer {secret}",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, content=payload_str, headers=headers)
            resp.raise_for_status()
            print(f"Callback successful for {result['url']}: {resp.json().get('message')}")
        except Exception as exc:
            print(f"Callback failed for {result['url']}: {exc}")

async def scrape_product(product: dict) -> ScrapeResult | None:
    """Run adapter to scrape a single product."""
    url = product.get("url")
    prod_id = product.get("id")
    print(f"\nScraping Product {prod_id}: {url}")
    
    adapter = get_adapter(url)
    if not adapter:
        print(f"No adapter found for URL: {url}")
        return None
        
    try:
        # Cron rescrapes should NOT regenerate LLM summary to save cost and speed up pipeline
        result = await adapter.scrape(url, want_summary=False)
        print(f"Scrape successful for: {result.title[:40]}... Price: {result.currentPrice}")
        return result
    except Exception as exc:
        print(f"Scrape failed for {url}: {exc}")
        return None

async def main():
    parser = argparse.ArgumentParser(description="PriceIQ Matrix Scraper CLI")
    parser.add_argument("--index", type=int, default=0, help="0-based matrix runner index")
    parser.add_argument("--total", type=int, default=1, help="Total matrix runner count")
    parser.add_argument("--backend-url", type=str, required=True, help="Next.js backend base URL")
    parser.add_argument("--secret", type=str, required=True, help="Shared scrape secret token")
    
    args = parser.parse_args()
    
    products = await fetch_urls(args.backend_url, args.index, args.total, args.secret)
    if not products:
        print("No products assigned to this partition. Exiting.")
        return
        
    for product in products:
        scraped = await scrape_product(product)
        if scraped:
            # Convert ScrapeResult to a dictionary matching the schema fields
            result_dict = {
                "url": scraped.url,
                "source": scraped.source,
                "title": scraped.title,
                "currentPrice": scraped.currentPrice,
                "originalPrice": scraped.originalPrice,
                "currency": scraped.currency,
                "image": scraped.image,
                "category": scraped.category,
                "stars": scraped.stars,
                "reviewsCount": scraped.reviewsCount,
                "isOutOfStock": scraped.isOutOfStock,
                "discountRate": scraped.discountRate,
                "description": scraped.description,
                "summary": scraped.summary,
                "scrapedAt": scraped.scrapedAt
            }
            await post_result(args.backend_url, result_dict, args.secret)
            
        # Subtle delay to introduce jitter and polite scraping interval
        await asyncio.sleep(1.5)

if __name__ == "__main__":
    asyncio.run(main())
