"""
Finance API Integration für Agenten.

Nutze yfinance, um echte Finanzdaten zu holen.
"""

from typing import Dict, Any, List, Optional

try:
    import yfinance as yf
except ImportError:
    yf = None


def get_ticker_overview(symbol: str) -> Dict[str, Any]:
    """Holt Basisdaten zu einem Aktien- oder Finanzwert."""
    if yf is None:
        return {}
    try:
        ticker = yf.Ticker(symbol)
        return ticker.info or {}
    except Exception:
        return {}


def get_historical_prices(symbol: str, period: str = "1mo", interval: str = "1d") -> List[Dict[str, Any]]:
    """Holt historische Preisdaten."""
    if yf is None:
        return []
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period, interval=interval)
        if data is None or data.empty:
            return []
        return [
            {
                "date": str(index.date()),
                "open": row.Open,
                "high": row.High,
                "low": row.Low,
                "close": row.Close,
                "volume": row.Volume,
            }
            for index, row in data.iterrows()
        ]
    except Exception:
        return []


def get_latest_price(symbol: str) -> Optional[float]:
    """Holt den letzten Preis eines Symbols."""
    if yf is None:
        return None
    try:
        ticker = yf.Ticker(symbol)
        return ticker.history(period="1d", interval="1m").get("Close").iloc[-1]
    except Exception:
        return None
