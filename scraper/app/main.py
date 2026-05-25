import asyncio
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .adapters.amazon import AmazonAdapter
from .adapters.flipkart import FlipkartAdapter
from .adapters.myntra import MyntraAdapter
from .config import settings
from .models import BatchScrapeRequest, HealthResult, ScrapeRequest, ScrapeResult

app = FastAPI(title="PriceIQ Scraper", version="2.0.0")
security = HTTPBearer()

ADAPTERS = [AmazonAdapter(), MyntraAdapter(), FlipkartAdapter()]


def _get_adapter(url: str):
    for adapter in ADAPTERS:
        if adapter.can_handle(url):
            return adapter
    return None


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != settings.scraper_bearer_token:
        raise HTTPException(status_code=401, detail="Invalid bearer token")


@app.get("/health", response_model=HealthResult)
async def health():
    return HealthResult(
        ok=True,
        adapters={"amazon": True, "myntra": True, "flipkart": True},
    )


@app.post("/scrape", response_model=ScrapeResult, dependencies=[Depends(verify_token)])
async def scrape(req: ScrapeRequest):
    adapter = _get_adapter(req.url)
    if not adapter:
        raise HTTPException(status_code=422, detail=f"Unsupported URL: {req.url}")

    try:
        result = await adapter.scrape(req.url, want_summary=req.want_summary)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Scrape failed: {exc}")

    return result


@app.post(
    "/scrape/batch",
    response_model=list[ScrapeResult | None],
    dependencies=[Depends(verify_token)],
)
async def scrape_batch(req: BatchScrapeRequest):
    async def _safe(url: str) -> ScrapeResult | None:
        adapter = _get_adapter(url)
        if not adapter:
            return None
        try:
            return await adapter.scrape(url, want_summary=req.want_summary)
        except Exception:
            return None

    return await asyncio.gather(*[_safe(u) for u in req.urls])
