"""
You.com search API client for concept enrichment.
"""
import requests

# Import from parent package (config lives in api/ when run from api/)
try:
    from api.config import YOU_COM_API_KEY, YOU_COM_SEARCH_URL
except ImportError:
    from config import YOU_COM_API_KEY, YOU_COM_SEARCH_URL


def search(query: str, count: int = 3) -> list[dict]:
    """
    Call You.com search; return list of items with title, description, snippets.
    Returns [] if no API key or on error.
    """
    if not YOU_COM_API_KEY:
        return []
    try:
        resp = requests.get(
            YOU_COM_SEARCH_URL,
            params={"query": query, "count": count},
            headers={"X-API-Key": YOU_COM_API_KEY},
            timeout=10,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        results = data.get("results") or data
        web = results.get("web") if isinstance(results, dict) else []
        if not isinstance(web, list):
            web = []
        return [
            {
                "title": r.get("title", ""),
                "description": r.get("description", ""),
                "snippets": (r.get("snippets") or [])[:2],
            }
            for r in web[:count]
        ]
    except Exception:
        return []
