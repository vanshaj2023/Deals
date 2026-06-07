import json
import random
import re
from datetime import datetime, timezone

import httpx
from selectolax.parser import HTMLParser

from ..llm import summarize
from ..models import ScrapeResult
from ..proxy import wrap_url
from .base import BaseAdapter

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

HEADERS_BASE = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "DNT": "1",
}


def _text(tree: HTMLParser, selector: str, default: str = "") -> str:
    node = tree.css_first(selector)
    return node.text(strip=True) if node else default


def _extract_price(tree: HTMLParser, *selectors: str) -> float:
    for selector in selectors:
        node = tree.css_first(selector)
        if node:
            raw = re.sub(r"[^\d.]", "", node.text(strip=True))
            # keep only first valid number
            match = re.search(r"\d+\.?\d*", raw)
            if match:
                try:
                    return float(match.group())
                except ValueError:
                    continue
    return 0.0


def _extract_images(tree: HTMLParser) -> list[str]:
    for sel in ("#imgBlkFront", "#landingImage"):
        node = tree.css_first(sel)
        if node:
            data = node.attributes.get("data-a-dynamic-image")
            if data:
                try:
                    return list(json.loads(data).keys())
                except (json.JSONDecodeError, AttributeError):
                    pass
            src = node.attributes.get("src") or node.attributes.get("data-old-hires")
            if src:
                return [src]
    return []


def _extract_description(tree: HTMLParser) -> str:
    selectors = [
        "#feature-bullets ul li span.a-list-item",
        ".a-unordered-list .a-list-item",
        "#productDescription p",
    ]
    for selector in selectors:
        nodes = tree.css(selector)
        if nodes:
            texts = [n.text(strip=True) for n in nodes if len(n.text(strip=True)) > 10]
            if texts:
                result = ". ".join(texts)
                return result[:2500] + "..." if len(result) > 2500 else result
    return ""


class AmazonAdapter(BaseAdapter):
    def can_handle(self, url: str) -> bool:
        return "amazon." in url

    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        headers = {**HEADERS_BASE, "User-Agent": random.choice(USER_AGENTS)}

        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers=headers,
        ) as client:
            resp = await client.get(wrap_url(url))
            resp.raise_for_status()
            html = resp.text

        if "captcha" in html.lower() and len(html) < 20_000:
            raise RuntimeError("Amazon returned a CAPTCHA page")

        tree = HTMLParser(html)

        title = _text(tree, "#productTitle")
        if not title:
            title = _text(tree, "h1.a-size-large")

        current_price = _extract_price(
            tree,
            ".priceToPay span.a-price-whole",
            ".a-price.priceToPay .a-offscreen",
            "#priceblock_ourprice",
            "#priceblock_dealprice",
            ".a-price .a-offscreen",
        )
        original_price = _extract_price(
            tree,
            ".a-price.a-text-price span.a-offscreen",
            "#listPrice",
            ".a-price.a-text-price .a-offscreen",
        ) or current_price

        currency_node = tree.css_first(".a-price-symbol")
        currency = currency_node.text(strip=True)[0] if currency_node else "$"

        images = _extract_images(tree)
        image = images[0] if images else ""

        out_of_stock_text = _text(tree, "#availability span").lower()
        is_out_of_stock = "unavailable" in out_of_stock_text or "out of stock" in out_of_stock_text

        discount_raw = _text(tree, ".savingsPercentage")
        discount_rate = float(re.sub(r"[^\d.]", "", discount_raw) or "0")
        if discount_rate == 0 and current_price and original_price > current_price:
            discount_rate = round((original_price - current_price) / original_price * 100, 1)

        stars_raw = _text(tree, "span.a-icon-alt") or _text(tree, "#acrPopover")
        stars_match = re.search(r"[\d.]+", stars_raw)
        stars = float(stars_match.group()) if stars_match else 0.0

        reviews_raw = re.sub(r"[^\d]", "", _text(tree, "#acrCustomerReviewText"))
        reviews_count = int(reviews_raw) if reviews_raw else 0

        breadcrumb_nodes = tree.css(
            "#wayfinding-breadcrumbs_feature_div ul li:nth-last-child(2) a"
        )
        category = breadcrumb_nodes[0].text(strip=True) if breadcrumb_nodes else "General"

        description = _extract_description(tree)

        summary: str | None = None
        if want_summary and description:
            summary = await summarize(title, description)

        return ScrapeResult(
            source="amazon",
            url=url,
            title=title,
            currentPrice=current_price,
            originalPrice=original_price,
            currency=currency,
            image=image,
            category=category or "General",
            stars=stars,
            reviewsCount=reviews_count,
            isOutOfStock=is_out_of_stock,
            discountRate=discount_rate,
            description=description,
            summary=summary,
            scrapedAt=datetime.now(timezone.utc).isoformat(),
        )
