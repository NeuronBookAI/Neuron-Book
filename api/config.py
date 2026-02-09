"""
App config and env-based settings.
"""
import os

# You.com (research enrichment)
YOU_COM_API_KEY = os.environ.get("YOU_COM_API_KEY", "")
YOU_COM_SEARCH_URL = os.environ.get(
    "YOU_COM_SEARCH_URL",
    "https://ydc-index.io/v1/search",
)

# CORS origins for local dev (Next.js)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
