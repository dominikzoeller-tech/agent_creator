"""
News API Integration für Agenten.

Nutzt NewsAPI.org zum Abrufen aktueller Nachrichten.
"""

import os
import requests
from typing import Dict, Any, List, Optional

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
BASE_URL = "https://newsapi.org/v2"


def _get_headers() -> Dict[str, str]:
    return {"Authorization": NEWSAPI_KEY} if NEWSAPI_KEY else {}


def get_top_headlines(query: str, language: str = "en", page_size: int = 5) -> List[Dict[str, Any]]:
    """Holt Top-News für eine Suchanfrage."""
    if not NEWSAPI_KEY:
        return []

    try:
        response = requests.get(
            f"{BASE_URL}/top-headlines",
            headers=_get_headers(),
            params={"q": query, "language": language, "pageSize": page_size},
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        return result.get("articles", [])
    except requests.RequestException:
        return []


def search_news(query: str, language: str = "en", page_size: int = 5) -> List[Dict[str, Any]]:
    """Sucht Nachrichtenartikel nach Schlüsselbegriff."""
    if not NEWSAPI_KEY:
        return []

    try:
        response = requests.get(
            f"{BASE_URL}/everything",
            headers=_get_headers(),
            params={"q": query, "language": language, "pageSize": page_size},
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        return result.get("articles", [])
    except requests.RequestException:
        return []
