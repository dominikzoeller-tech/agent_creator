"""
Crypto API Integration für Agenten.

Bietet Zugriff auf CoinGecko für echte Krypto-Daten.
"""

import requests
from typing import Dict, Any, Optional

BASE_URL = "https://api.coingecko.com/api/v3"


def get_coin_price(symbol: str, vs_currency: str = "usd") -> Optional[float]:
    """Holt den aktuellen Preis einer Kryptowährung von CoinGecko."""
    try:
        response = requests.get(
            f"{BASE_URL}/simple/price",
            params={"ids": symbol.lower(), "vs_currencies": vs_currency.lower()},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        return data.get(symbol.lower(), {}).get(vs_currency.lower())
    except requests.RequestException:
        return None


def get_coin_market_data(symbol: str) -> Dict[str, Any]:
    """Holt Marktdaten für ein Coin aus CoinGecko."""
    try:
        response = requests.get(
            f"{BASE_URL}/coins/{symbol.lower()}",
            params={"localization": "false", "tickers": "false", "market_data": "true", "community_data": "false", "developer_data": "false", "sparkline": "false"},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return {}


def search_coin(symbol: str) -> Dict[str, Any]:
    """Sucht eine Kryptowährung über CoinGecko."""
    try:
        response = requests.get(
            f"{BASE_URL}/search",
            params={"query": symbol},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return {}
