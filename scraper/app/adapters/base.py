from abc import ABC, abstractmethod
from ..models import ScrapeResult


class BaseAdapter(ABC):
    @abstractmethod
    async def scrape(self, url: str, want_summary: bool = False) -> ScrapeResult:
        pass

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        pass
