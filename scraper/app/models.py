from pydantic import BaseModel
from typing import Optional


class ScrapeRequest(BaseModel):
    url: str
    want_summary: bool = False


class BatchScrapeRequest(BaseModel):
    urls: list[str]
    want_summary: bool = False


class ScrapeResult(BaseModel):
    source: str
    url: str
    title: str
    currentPrice: float
    originalPrice: float
    currency: str
    image: str
    category: str
    stars: float
    reviewsCount: int
    isOutOfStock: bool
    discountRate: float
    description: str
    summary: Optional[str] = None
    scrapedAt: str


class HealthResult(BaseModel):
    ok: bool
    adapters: dict[str, bool]
