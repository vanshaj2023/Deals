from groq import AsyncGroq
from .config import settings

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


async def summarize(title: str, description: str) -> str | None:
    if not settings.groq_api_key:
        return None

    try:
        resp = await _get_client().chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You write concise 2-3 sentence product summaries. "
                        "Focus on key features and who it's for. Plain text only, no markdown."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Product: {title}\n\nFeatures:\n{description[:1500]}",
                },
            ],
            temperature=0.2,
            max_tokens=200,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return None
