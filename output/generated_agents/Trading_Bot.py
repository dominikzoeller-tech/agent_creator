import os
import requests
import logging
from requests.exceptions import RequestException
from typing import Dict, Any, Optional

class TradingBot:
    """
    This is a trading bot for cryptocurrency using the CryptoExchange API.
    """

    SUPPORTED_METHODS = ['get', 'post']

    def __init__(self, api_key: str, api_secret: str, base_url: str):
        """
        Initialize the bot with the API key and secret from the CryptoExchange platform.
        Also initializes the base_url for the CryptoExchange API.
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url

    def call_api(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calls the API with the specified method, endpoint, and data.
        """
        if method not in self.SUPPORTED_METHODS:
            logging.error(f"Unsupported method: {method}")
            return {}

        headers = {
            'Authorization': f'Bearer {self.api_key}:{self.api_secret}'
        }

        try:
            if method == 'get':
                response = requests.get(self.base_url + endpoint, headers=headers)
            elif method == 'post':
                response = requests.post(self.base_url + endpoint, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except RequestException as e:
            logging.error(f"Error while calling the API: {e}")
            return {}

    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """
        Fetches the market data for a specific symbol.
        """
        if not symbol:
            logging.error("Symbol is required to fetch market data.")
            return {}

        return self.call_api('get', f'/marketdata/{symbol}')

    def execute_trade(self, symbol: str, action: str, quantity: float) -> Dict[str, Any]:
        """
        Executes a trade for a specific symbol.
        """
        if not symbol or not action or quantity <= 0:
            logging.error("Invalid trade parameters.")
            return {}

        data = {
            'action': action,
            'quantity': quantity
        }
        return self.call_api('post', f'/trades/{symbol}', data)

    def get_account_info(self) -> Dict[str, Any]:
        """
        Fetches the account information.
        """
        return self.call_api('get', '/account')

# Set up logging
logging.basicConfig(filename='trading_bot.log', level=logging.ERROR)

# Check if API Key, Secret, and Base URL are set
api_key = os.getenv('API_KEY')
api_secret = os.getenv('API_SECRET')
base_url = os.getenv('BASE_URL')

if not api_key or not api_secret or not base_url:
    logging.error("API Key, Secret or Base URL is not set. Please check your environment variables.")
else:
    bot = TradingBot(api_key, api_secret, base_url)

    # Fetch market data
    market_data = bot.get_market_data('BTC')
    logging.info(market_data)

    # Execute a trade
    trade_result = bot.execute_trade('BTC', 'buy', 1.0)
    logging.info(trade_result)

    # Fetch account info
    account_info = bot.get_account_info()
    logging.info(account_info)