"""
App config and env-based settings.
Loads .env from project root so YOU_COM_API_KEY is set when Flask runs via npm run dev.
"""
import os
from pathlib import Path

# Load .env from repo root (parent of api/) when running as flask --app index run
_root = Path(__file__).resolve().parent.parent
_dotenv = _root / ".env"
if _dotenv.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_dotenv)
    except ImportError:
        pass

# You.com (search + Express LLM)
YOU_COM_API_KEY = (os.environ.get("YOU_COM_API_KEY") or "").strip()
YOU_COM_SEARCH_URL = os.environ.get(
    "YOU_COM_SEARCH_URL",
    "https://ydc-index.io/v1/search",
)
YOU_COM_EXPRESS_URL = os.environ.get(
    "YOU_COM_EXPRESS_URL",
    "https://api.you.com/v1/agents/runs",
)

# CORS origins for local dev (Next.js)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
