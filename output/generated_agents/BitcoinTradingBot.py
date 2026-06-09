import os
import time
import logging
from enum import Enum
from typing import Dict, Any, Optional, Callable

try:
    import ccxt
except ModuleNotFoundError:
    raise SystemExit("Please install the 'ccxt' module. Run 'pip install ccxt'")

class Symbol(Enum):
    BTCUSDT = 'BTC/USDT'

class Side(Enum):
    BUY = 'buy'
    SELL = 'sell'

class TradingBot:
    """
    Trading bot for Bitcoin trading
    """

    def __init__(self, api_key: str, api_secret: str, trading_strategy: Callable[[Dict[str, Any]], Side], amount: float):
        """
        Initialize the trading bot with the given Binance API key and secret.
        """
        if api_key is None or api_secret is None:
            raise ValueError("API key and secret must be set")

        self.binance = ccxt.binance({
            'apiKey': api_key,
            'secret': api_secret
        })
        self.trading_strategy = trading_strategy
        self.amount = amount

    def get_market_data(self, symbol: Symbol) -> Optional[Dict[str, Any]]:
        """
        Get market data for the given symbol.
        """
        try:
            return self.binance.fetch_ticker(symbol.value)
        except (ccxt.NetworkError, ccxt.ExchangeError) as e:
            logging.error(f"An error occurred while fetching the market data: {e}")
            return None

    def place_order(self, symbol: Symbol, side: Side) -> None:
        """
        Place an order with the given parameters.
        """
        try:
            self.binance.create_order(symbol.value, 'market', side.value, self.amount)
        except (ccxt.InsufficientFunds, ccxt.InvalidOrder) as e:
            logging.error(f"An error occurred while placing the order: {e}")

def main():
    """
    Main function that initialize the bot and make a simple trading.
    """

    def simple_strategy(data: Dict[str, Any]) -> Optional[Side]:
        if data.get('last') < 10000:
            return Side.BUY
        elif data.get('last') > 20000:
            return Side.SELL
        else:
            return None

    api_key = os.getenv('BINANCE_API_KEY')
    api_secret = os.getenv('BINANCE_API_SECRET')

    if api_key is None or api_secret is None:
        raise EnvironmentError("API key and secret must be set in the environment variables")

    bot = TradingBot(api_key, api_secret, simple_strategy, 0.01)

    # continuously fetch market data and make decisions
    while True:
        data = bot.get_market_data(Symbol.BTCUSDT)

        # apply the trading strategy
        if data:
            decision = bot.trading_strategy(data)
            if decision:
                bot.place_order(Symbol.BTCUSDT, decision)

        # sleep for a while before the next iteration
        time.sleep(60)

if __name__ == "__main__":
    main()