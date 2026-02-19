"""
You.com API client: search (concept enrichment) and Express (LLM for Socratic questions).
"""
import requests

# Import from parent package (config lives in api/ when run from api/)
try:
    from api.config import (
        YOU_COM_API_KEY,
        YOU_COM_SEARCH_URL,
        YOU_COM_EXPRESS_URL,
    )
except ImportError:
    from config import (
        YOU_COM_API_KEY,
        YOU_COM_SEARCH_URL,
        YOU_COM_EXPRESS_URL,
    )


def express_ask(prompt: str, timeout: int = 25):
    """
    Call You.com Express API (LLM). Returns the agent's text answer or None on error.
    Uses same API key as search; auth is Bearer for Express.
    """
    if not YOU_COM_API_KEY:
        return None
    try:
        resp = requests.post(
            YOU_COM_EXPRESS_URL,
            json={
                "agent": "express",
                "input": prompt,
                "stream": False,
            },
            headers={
                "Authorization": f"Bearer {YOU_COM_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=timeout,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        output = data.get("output") or []
        for item in output:
            if item.get("type") == "message.answer" and item.get("text"):
                return (item.get("text") or "").strip()
        return None
    except Exception:
        return None


def search(query: str, count: int = 3):
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
