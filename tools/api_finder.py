import json
from typing import List, Dict, Optional
from core.llm import get_llm_client


def find_apis_for_task(
    task_description: str,
    constraints: Optional[str] = None,
    max_apis: int = 4,
) -> List[Dict[str, str]]:
    """Finde passende APIs für eine gegebene Aufgabe."""
    description = task_description.lower()
    apis: List[Dict[str, str]] = []

    if any(keyword in description for keyword in ["crypto", "bitcoin", "ethereum", "krypto", "coin"]):
        apis.append(
            {
                "name": "CoinGecko",
                "description": "Echte Krypto-Marktdaten für Preise, historische Daten und Coin-Informationen.",
                "example_usage": "from integrations.crypto_api import get_coin_price\nprice = get_coin_price('bitcoin')",
            }
        )

    if any(keyword in description for keyword in ["news", "nachrichten", "headline", "article"]):
        apis.append(
            {
                "name": "NewsAPI",
                "description": "Aktuelle Nachrichten und Artikel über NewsAPI.org.",
                "example_usage": "from integrations.news_api import get_top_headlines\narticles = get_top_headlines('bitcoin')",
            }
        )

    if any(keyword in description for keyword in ["finance", "stock", "ticker", "yahoo", "aktie", "trading"]):
        apis.append(
            {
                "name": "yfinance",
                "description": "Finanzdaten von Yahoo Finance für Kurse, historische Daten und Ticker-Informationen.",
                "example_usage": "from integrations.finance_api import get_latest_price\nprice = get_latest_price('AAPL')",
            }
        )

    if not apis:
        apis.append(
            {
                "name": "CoinGecko",
                "description": "Echte Krypto- und Marktdatenquelle.",
                "example_usage": "from integrations.crypto_api import get_coin_price\nprice = get_coin_price('bitcoin')",
            }
        )

    return apis[:max_apis]
