import asyncio
import json
import random
import re
from datetime import datetime, timezone

import httpx
from selectolax.parser import HTMLParser

from ..llm import summarize
from ..models import ScrapeResult
from ..proxy import using_proxy, wrap_url
from .base import BaseAdapter

try:
    from curl_cffi import requests as curl_requests  # type: ignore
    _HAS_CURL_CFFI = True
except Exception:
    _HAS_CURL_CFFI = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

BROWSER_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Sec-Ch-Ua": '"Chromium";v="126", "Not-A.Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "DNT": "1",
}


def _extract_product_id(url: str) -> str | None:
    clean = url.split("?")[0].rstrip("/")
    match = (
        re.search(r"/(\d{5,})/buy$", clean)
        or re.search(r"-(\d{5,})$", clean)
        or re.search(r"/(\d{5,})$", clean)
    )
    return match.group(1) if match else None


def _balanced_json_at(text: str, start: int) -> str | None:
    """Extract a balanced JSON object string starting at text[start] == '{'."""
    if start >= len(text) or text[start] != "{":
        return None
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(text)):
        c = text[i]
        if escape:
            escape = False
            continue
        if c == "\\":
            escape = True
            continue
        if c == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return None


def _extract_pdp_data(html: str) -> dict | None:
    """Find the pdpData object embedded in any script tag."""
    # Strategy 1: explicit window.__myx = { ... }
    m = re.search(r"window\.__myx\s*=\s*", html)
    if m:
        blob = _balanced_json_at(html, m.end())
        if blob:
            try:
                data = json.loads(blob)
                if isinstance(data, dict):
                    return data
            except json.JSONDecodeError:
                pass

    # Strategy 2: scan for any script containing "pdpData":{ and balance from there
    for sm in re.finditer(r'"pdpData"\s*:\s*\{', html):
        # Walk back to find the opening { of the wrapping object
        obj_start = sm.start()
        # The simplest approach: take pdpData itself (sub-object) and wrap it
        sub_start = sm.end() - 1  # position of '{'
        sub = _balanced_json_at(html, sub_start)
        if sub:
            try:
                return {"pdpData": json.loads(sub)}
            except json.JSONDecodeError:
                continue

    # Strategy 3: __NEXT_DATA__
    nm = re.search(
        r'<script id="__NEXT_DATA__"[^>]*>(\{.+?\})</script>',
        html, re.DOTALL,
    )
    if nm:
        try:
            data = json.loads(nm.group(1))
            return data.get("props", {}).get("pageProps", {}) or data
        except json.JSONDecodeError:
            pass

    # Strategy 4: JSON-LD product
    for jm in re.finditer(
        r'<script[^>]+type="application/ld\+json"[^>]*>(\{.+?\})</script>',
        html, re.DOTALL,
    ):
        try:
            ld = json.loads(jm.group(1))
            if isinstance(ld, dict) and ld.get("@type") == "Product":
                return {"_jsonld": ld}
        except json.JSONDecodeError:
            continue
    return None


async def _fetch_html(url: str) -> str:
    """Fetch with curl_cffi (Akamai-safe) when available, else httpx fallback."""
    headers = {**BROWSER_HEADERS, "User-Agent": random.choice(USER_AGENTS)}

    fetch_url = wrap_url(url)

    if _HAS_CURL_CFFI:
        def _sync_get() -> str:
            r = curl_requests.get(
                fetch_url,
                impersonate="chrome124",
                headers=headers,
                timeout=30,
                allow_redirects=True,
            )
            r.raise_for_status()
            return r.text

        return await asyncio.to_thread(_sync_get)

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=30.0,
        headers=headers,
        http2=True,
    ) as client:
        # Warm cookies only when hitting Myntra directly — proxied requests
        # don't share state across calls and a warmup just burns a credit.
        if not using_proxy():
            try:
                await client.get("https://www.myntra.com/", timeout=10.0)
            except Exception:
                pass
        resp = await client.get(fetch_url)
        resp.raise_for_status()
        return resp.text


def _parse_pdpdata(pdp: dict, url: str) -> ScrapeResult:
    title = " ".join(
        p for p in [
            (pdp.get("brand") or {}).get("name", ""),
            pdp.get("name", ""),
        ] if p
    ).strip() or pdp.get("name", "Myntra Product")

    # Price extraction with multiple fallback paths
    price_obj = pdp.get("price") if isinstance(pdp.get("price"), dict) else {}
    mrp = float(pdp.get("mrp") or price_obj.get("mrp") or 0)
    discounted = float(
        pdp.get("discountedPrice")
        or price_obj.get("discounted")
        or price_obj.get("price")
        or 0
    )
    # Fallback: lowest per-size discountedPrice
    if discounted <= 0:
        sizes = pdp.get("sizes") or []
        prices = [
            float((s.get("sizeSellerData") or {}).get("discountedPrice") or 0)
            for s in sizes
        ]
        prices = [p for p in prices if p > 0]
        if prices:
            discounted = min(prices)

    current_price = discounted or mrp
    original_price = mrp or current_price

    if current_price <= 0:
        raise RuntimeError("Myntra: no price found in pdpData")

    discount_rate = 0.0
    if original_price > current_price > 0:
        discount_rate = round((original_price - current_price) / original_price * 100, 1)
    discounts = pdp.get("discounts") or []
    if discounts and isinstance(discounts, list):
        label = (discounts[0] or {}).get("discountText", "")
        dm = re.search(r"(\d+(?:\.\d+)?)", label)
        if dm:
            discount_rate = float(dm.group(1))

    # Images: support both new (imageURL) and old (path) schemas
    media = pdp.get("media") or {}
    albums = media.get("albums") or []
    images: list[str] = []
    if albums and isinstance(albums[0], dict):
        for img in albums[0].get("images") or []:
            src = (
                img.get("imageURL")
                or img.get("secureSrc")
                or img.get("src")
            )
            if src:
                src = src.replace("($width)", "720").replace("($height)", "960").replace("($qualityPercentage)", "90")
                images.append(src)
            elif img.get("path"):
                images.append(
                    f"https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/{img['path']}"
                )
    image = images[0] if images else ""

    # Ratings
    ratings = pdp.get("ratings") or {}
    stars = float(ratings.get("averageRating") or 0)
    reviews_count = int(ratings.get("totalCount") or 0)

    # Category
    analytics = pdp.get("analytics") or {}
    category = (
        analytics.get("articleType")
        or analytics.get("masterCategory")
        or analytics.get("subCategory")
        or "Fashion"
    )

    # Stock: any in-stock size = in stock overall
    sizes = pdp.get("sizes") or []
    in_stock_sizes = [s for s in sizes if s.get("available")]
    is_out_of_stock = bool(sizes) and len(in_stock_sizes) == 0

    # Description
    description = ""
    product_details = pdp.get("productDetails") or []
    if isinstance(product_details, list):
        parts = []
        for d in product_details:
            content = d.get("content") or d.get("description") or ""
            if content:
                parts.append(HTMLParser(content).text(strip=True))
        description = ". ".join(parts)[:2500]
    if not description:
        descriptors = pdp.get("descriptors") or {}
        desc_obj = descriptors.get("description") or {}
        if isinstance(desc_obj, dict):
            description = HTMLParser(desc_obj.get("value", "")).text(strip=True)[:2500]

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
        summary=None,
        scrapedAt=datetime.now(timezone.utc).isoformat(),
    )


def _parse_jsonld(ld: dict, url: str) -> ScrapeResult:
    offers = ld.get("offers") or {}
    current_price = float(offers.get("price") or 0)
    if current_price <= 0:
        raise RuntimeError("Myntra JSON-LD has no price")

    availability = (offers.get("availability") or "").lower()
    is_out_of_stock = "outofstock" in availability or "soldout" in availability or "discontinued" in availability

    image_field = ld.get("image", "")
    if isinstance(image_field, list):
        image = image_field[0] if image_field else ""
    else:
        image = image_field or ""

    rating_obj = ld.get("aggregateRating") or {}

    return ScrapeResult(
        source="myntra",
        url=url,
        title=ld.get("name") or "Myntra Product",
        currentPrice=current_price,
        originalPrice=current_price,
        currency="₹",
        image=image,
        category=ld.get("category") or "Fashion",
        stars=float(rating_obj.get("ratingValue") or 0),
        reviewsCount=int(rating_obj.get("reviewCount") or rating_obj.get("ratingCount") or 0),
        isOutOfStock=is_out_of_stock,
        discountRate=0.0,
        description=(ld.get("description") or "")[:2500],
        summary=None,
        scrapedAt=datetime.now(timezone.utc).isoformat(),
    )


class MyntraAdapter(BaseAdapter):
    def can_handle(self, url: str) -> bool:
        return "myntra.com" in url

    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        product_id = _extract_product_id(url)
        if not product_id:
            raise RuntimeError(f"Could not extract Myntra product ID from URL: {url}")

        pdp_url = f"https://www.myntra.com/{product_id}"
        html = await _fetch_html(pdp_url)

        blob = _extract_pdp_data(html)
        if not blob:
            snippet = re.sub(r"\s+", " ", html[:1500])
            raise RuntimeError(
                f"Myntra: no pdpData/JSON-LD found. html_len={len(html)} snippet={snippet[:600]}"
            )

        if "_jsonld" in blob:
            result = _parse_jsonld(blob["_jsonld"], url)
        else:
            pdp = blob.get("pdpData") or blob.get("pdp", {}).get("pdpData") or blob
            if not pdp or not isinstance(pdp, dict):
                raise RuntimeError(f"Myntra: pdpData empty. blob keys={list(blob.keys())[:10]}")
            result = _parse_pdpdata(pdp, url)

        if want_summary and result.description:
            result.summary = await summarize(result.title, result.description)

        return result
