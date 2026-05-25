import random
import re
from datetime import datetime, timezone

import httpx
from selectolax.parser import HTMLParser

from ..llm import summarize
from ..models import ScrapeResult
from .base import BaseAdapter

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

HEADERS_BASE = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": "https://www.myntra.com/",
    "Origin": "https://www.myntra.com",
    "DNT": "1",
}


def _extract_product_id(url: str) -> str | None:
    # Myntra URLs: /brand/product/style-id or /brand-product/style-id/buy
    match = re.search(r"/(\d+)/buy", url) or re.search(r"-(\d+)$", url.rstrip("/"))
    return match.group(1) if match else None


class MyntraAdapter(BaseAdapter):
    def can_handle(self, url: str) -> bool:
        return "myntra.com" in url

    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        product_id = _extract_product_id(url)
        if not product_id:
            raise RuntimeError(f"Could not extract Myntra product ID from URL: {url}")

        headers = {**HEADERS_BASE, "User-Agent": random.choice(USER_AGENTS)}

        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers=headers,
        ) as client:
            api_url = f"https://www.myntra.com/gateway/v2/product/{product_id}"
            resp = await client.get(api_url)
            resp.raise_for_status()
            data = resp.json()

        style = data.get("style", {})
        if not style:
            raise RuntimeError("Myntra API returned empty product data")

        title_parts = [
            style.get("brandName", ""),
            style.get("name", ""),
        ]
        title = " ".join(p for p in title_parts if p).strip()

        price_info = style.get("priceInfo", {})
        current_price = float(price_info.get("discountedPrice", 0) or price_info.get("price", 0))
        original_price = float(price_info.get("mrp", 0) or current_price)
        discount_rate = float(price_info.get("discountPercent", 0) or 0)
        if discount_rate == 0 and original_price > current_price > 0:
            discount_rate = round((original_price - current_price) / original_price * 100, 1)

        media = style.get("media", {})
        images = [
            f"https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/{img['path']}"
            for img in media.get("albums", [{}])[0].get("images", [])
            if img.get("path")
        ]
        image = images[0] if images else ""

        rating_summary = style.get("ratingSummary", {})
        stars = float(rating_summary.get("averageRating", 0) or 0)
        reviews_count = int(rating_summary.get("totalCount", 0) or 0)

        analytics = style.get("analytics", {})
        category = analytics.get("category") or analytics.get("masterCategory") or "Fashion"

        sizes = style.get("sizes", [])
        is_out_of_stock = all(
            not s.get("sizeAvailability", False) for s in sizes
        ) if sizes else False

        descriptors = style.get("productDescriptors", {})
        desc_html = (
            descriptors.get("description", {}).get("value", "")
            or descriptors.get("style_note", {}).get("value", "")
        )
        if desc_html:
            desc_tree = HTMLParser(desc_html)
            description = desc_tree.text(strip=True)[:2500]
        else:
            key_specs = style.get("keySpecs", [])
            description = ". ".join(key_specs)[:2500]

        summary: str | None = None
        if want_summary and description:
            summary = await summarize(title, description)

        return ScrapeResult(
            source="myntra",
            url=url,
            title=title,
            currentPrice=current_price,
            originalPrice=original_price,
            currency="₹",
            image=image,
            category=category,
            stars=stars,
            reviewsCount=reviews_count,
            isOutOfStock=is_out_of_stock,
            discountRate=discount_rate,
            description=description,
            summary=summary,
            scrapedAt=datetime.now(timezone.utc).isoformat(),
        )
