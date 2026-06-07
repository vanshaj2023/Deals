import os
from urllib.parse import quote_plus


def wrap_url(url: str, *, render: bool = False) -> str:
    """Route the request through ScraperAPI when SCRAPER_API_KEY is set.

    Returns the original URL when no key is configured, so local/dev runs
    and self-hosted runners hit the target site directly.
    """
    key = os.getenv("SCRAPER_API_KEY")
    if not key:
        return url

    params = [
        f"api_key={key}",
        f"url={quote_plus(url)}",
        "country_code=in",
    ]
    if render:
        params.append("render=true")
    return f"http://api.scraperapi.com/?{'&'.join(params)}"


def using_proxy() -> bool:
    return bool(os.getenv("SCRAPER_API_KEY"))
