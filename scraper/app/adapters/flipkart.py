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
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
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
            match = re.search(r"\d+\.?\d*", raw)
            if match:
                try:
                    return float(match.group())
                except ValueError:
                    continue
    return 0.0


def _extract_json_price(text: str, key: str) -> float:
    match = re.search(rf'"{key}"\s*:\s*(\d+(?:\.\d+)?)', text)
    return float(match.group(1)) if match else 0.0


class FlipkartAdapter(BaseAdapter):
    def can_handle(self, url: str) -> bool:
        return "flipkart.com" in url

    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        headers = {**HEADERS_BASE, "User-Agent": random.choice(USER_AGENTS)}

        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers=headers,
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text

        if len(html) < 5000:
            raise RuntimeError("Flipkart returned a suspiciously short page (possible block)")

        tree = HTMLParser(html)

        title = (
            _text(tree, "span.VU-ZEz")
            or _text(tree, "h1.yhB1nd span")
            or _text(tree, "h1.G6XhRU")
            or _text(tree, "h1")
        )

        current_price = _extract_price(
            tree,
            "div.Nx9bqj.CxhGGd",
            "div.hl05eU div.Nx9bqj",
            "div._30jeq3._16Jk6d",
            "div._30jeq3",
        )
        original_price = _extract_price(
            tree,
            "div.yRaY8j.ZYYwLA",
            "div.hl05eU div.yRaY8j",
            "div._3I9_wc._2p6lqe",
            "div._3I9_wc",
        ) or current_price

        discount_raw = (
            _text(tree, "div.UkUFwK span")
            or _text(tree, "div._3Ay6Sb._31Dcoz span")
        )
        discount_rate = float(re.sub(r"[^\d.]", "", discount_raw) or "0")
        if discount_rate == 0 and current_price and original_price > current_price:
            discount_rate = round((original_price - current_price) / original_price * 100, 1)

        img_node = tree.css_first("img._396cs4") or tree.css_first("img._2r_T1I") or tree.css_first("div._3GnUWp img")
        image = img_node.attributes.get("src", "") if img_node else ""
        if image and image.startswith("//"):
            image = "https:" + image

        availability_text = _text(tree, "div._16FRp0").lower()
        is_out_of_stock = "out of stock" in availability_text or "sold out" in availability_text

        stars_raw = _text(tree, "div.XQDdHH") or _text(tree, "div._3LWZlK")
        stars_match = re.search(r"[\d.]+", stars_raw)
        stars = float(stars_match.group()) if stars_match else 0.0

        reviews_raw = re.sub(r"[^\d]", "", _text(tree, "span.Wphh3N") or _text(tree, "span._2_R_DZ"))
        reviews_count = int(reviews_raw) if reviews_raw else 0

        breadcrumb_nodes = tree.css("div._3GIHBu a") or tree.css("div.LtENGf a")
        if len(breadcrumb_nodes) >= 2:
            category = breadcrumb_nodes[-2].text(strip=True) or "General"
        elif breadcrumb_nodes:
            category = breadcrumb_nodes[-1].text(strip=True) or "General"
        else:
            category = "General"

        desc_nodes = (
            tree.css("div._1mXcCf.RmoJze li")
            or tree.css("div._2418kt li")
            or tree.css("div.X3BRps li")
        )
        if desc_nodes:
            texts = [n.text(strip=True) for n in desc_nodes if len(n.text(strip=True)) > 5]
            description = ". ".join(texts)[:2500]
        else:
            desc_node = tree.css_first("div._1AN87F") or tree.css_first("div.RmoJze")
            description = desc_node.text(strip=True)[:2500] if desc_node else ""

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
            category=category,
            stars=stars,
            reviewsCount=reviews_count,
            isOutOfStock=is_out_of_stock,
            discountRate=discount_rate,
            description=description,
            summary=summary,
            scrapedAt=datetime.now(timezone.utc).isoformat(),
        )
