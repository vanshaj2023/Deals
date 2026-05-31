import json
import random
import re
from datetime import datetime, timezone

import httpx

from ..llm import summarize
from ..models import ScrapeResult
from .base import BaseAdapter

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

HEADERS_BASE = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Sec-Ch-Ua": '"Chromium";v="124", "Not A(Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}


def _parse_jsonld(html: str) -> dict | None:
    # Stable: <script id="jsonLD" type="application/ld+json">[{...}]</script>
    m = re.search(
        r'<script[^>]+id="jsonLD"[^>]*>(\[.*?\]|\{.*?\})</script>',
        html, re.DOTALL,
    )
    if not m:
        # Fallback: any ld+json with @type Product
        for sm in re.finditer(
            r'<script[^>]+type="application/ld\+json"[^>]*>(\[.*?\]|\{.*?\})</script>',
            html, re.DOTALL,
        ):
            try:
                raw = json.loads(sm.group(1))
                items = raw if isinstance(raw, list) else [raw]
                for it in items:
                    if isinstance(it, dict) and it.get("@type") == "Product":
                        return it
            except json.JSONDecodeError:
                continue
        return None
    try:
        raw = json.loads(m.group(1))
        items = raw if isinstance(raw, list) else [raw]
        for it in items:
            if isinstance(it, dict) and it.get("@type") == "Product":
                return it
    except json.JSONDecodeError:
        return None
    return None


def _extract_mrp(html: str) -> tuple[float, float]:
    """Returns (finalPrice, mrp) from window.__INITIAL_STATE__ blob."""
    m = re.search(r'"finalPrice":(\d+(?:\.\d+)?),"mrp":(\d+(?:\.\d+)?)', html)
    if m:
        return float(m.group(1)), float(m.group(2))
    return 0.0, 0.0


def _detect_stock(jsonld: dict | None, html: str) -> bool:
    """Returns True if out of stock."""
    if jsonld:
        availability = (jsonld.get("offers") or {}).get("availability", "") or ""
        if availability:
            return not availability.endswith("InStock")

    state_match = re.search(r'"availabilityStatus":"([A-Z_]+)"', html)
    if state_match:
        return state_match.group(1) != "IN_STOCK"

    lower = html.lower()
    for phrase in ("currently out of stock", "sold out", "notify me when available", "coming soon"):
        if phrase in lower:
            return True
    return False


class FlipkartAdapter(BaseAdapter):
    def can_handle(self, url: str) -> bool:
        return "flipkart.com" in url

    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        headers = {**HEADERS_BASE, "User-Agent": random.choice(USER_AGENTS)}

        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=20.0,
            headers=headers,
            http2=True,
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text

        if len(html) < 5000:
            raise RuntimeError("Flipkart returned a suspiciously short page (possible block)")

        ld = _parse_jsonld(html)

        # Title
        title = (ld or {}).get("name", "")
        if not title:
            t_match = re.search(r'<meta property="og:title" content="([^"]+)"', html)
            title = t_match.group(1) if t_match else ""

        # Prices
        final_price, mrp = _extract_mrp(html)
        ld_price = float((ld or {}).get("offers", {}).get("price") or 0)
        current_price = final_price or ld_price
        original_price = mrp or current_price
        if current_price <= 0:
            has_jsonld_tag = "application/ld+json" in html
            has_initial_state = "__INITIAL_STATE__" in html
            has_pricing_text = "₹" in html
            has_app_redirect = "Open in App" in html or "appOnly" in html
            snippet = re.sub(r"\s+", " ", html[:1200])
            raise RuntimeError(
                f"Flipkart price extraction failed. "
                f"html_len={len(html)} ld_found={ld is not None} "
                f"has_ldjson_tag={has_jsonld_tag} has_initial_state={has_initial_state} "
                f"has_rupee={has_pricing_text} app_redirect={has_app_redirect} "
                f"snippet={snippet[:600]}"
            )

        discount_rate = 0.0
        if original_price > current_price > 0:
            discount_rate = round((original_price - current_price) / original_price * 100, 1)

        # Image
        image = ""
        if ld:
            img_field = ld.get("image")
            if isinstance(img_field, list) and img_field:
                image = img_field[0]
            elif isinstance(img_field, str):
                image = img_field
        if not image:
            im = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            image = im.group(1) if im else ""

        # Rating + reviews
        stars = 0.0
        reviews_count = 0
        if ld:
            agg = ld.get("aggregateRating") or {}
            stars = float(agg.get("ratingValue") or 0)
            reviews_count = int(agg.get("reviewCount") or agg.get("ratingCount") or 0)

        # Category
        category = (ld or {}).get("category") or "General"
        if isinstance(category, list):
            category = category[0] if category else "General"

        # Stock
        is_out_of_stock = _detect_stock(ld, html)

        # Description
        description = (ld or {}).get("description") or ""
        if not description:
            dm = re.search(r'<meta name="description" content="([^"]+)"', html)
            description = dm.group(1) if dm else ""
        description = description[:2500]

        summary: str | None = None
        if want_summary and description:
            summary = await summarize(title, description)

        return ScrapeResult(
            source="flipkart",
            url=url,
            title=title,
            currentPrice=current_price,
            originalPrice=original_price,
            currency="₹",
            image=image,
            category=str(category),
            stars=stars,
            reviewsCount=reviews_count,
            isOutOfStock=is_out_of_stock,
            discountRate=discount_rate,
            description=description,
            summary=summary,
            scrapedAt=datetime.now(timezone.utc).isoformat(),
        )
