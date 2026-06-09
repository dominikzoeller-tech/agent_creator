import requests
import os
import logging
from typing import Dict, Any, Tuple
from urllib.parse import quote

logging.basicConfig(level=logging.INFO)

class RealEstateValuationBot:
    """
    A class used to represent a Real Estate Valuation Bot

    ...

    Attributes
    ----------
    api_key : str
        a string that represents the API key for Zillow

    Methods
    -------
    fetch_property_data():
        Fetches property data from Zillow API
    process_data():
        Processes the received data
    evaluate_property():
        Evaluates the property based on processed data
    """

    def __init__(self, api_key: str) -> None:
        """
        Parameters
        ----------
        api_key : str
            The API key for Zillow
        """
        self.api_key = api_key
        self.base_url = os.getenv('BASE_URL')

    def fetch_property_data(self, address: str, citystatezip: str) -> Dict[str, Any]:
        """
        Fetches property data from Zillow API

        Parameters
        ----------
        address : str
            The address of the property
        citystatezip : str
            The city and state zip of the property

        Returns
        -------
        dict
            The property data
        """
        url = f"{self.base_url}?zws-id={self.api_key}&address={quote(address)}&citystatezip={quote(citystatezip)}"
        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.RequestException as err:
            logging.error(f"API request failed: {err}")
            raise
        data = response.json()
        return data

    def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes the received data

        Parameters
        ----------
        data : dict
            The raw property data

        Returns
        -------
        dict
            The processed property data
        """
        # Here, add actual data processing, for example, handling missing values or normalizing data.
        # This is just a placeholder for illustration purpose.
        processed_data = data.get('results', {})
        return processed_data

    def evaluate_property(self, processed_data: Dict[str, Any]) -> float:
        """
        Evaluates the property based on processed data

        Parameters
        ----------
        processed_data : dict
            The processed property data

        Returns
        -------
        float
            The estimated property value
        """
        # Here, add actual property evaluation, using comparison price, income value, or substance value.
        # This is just a placeholder for illustration purpose.
        estimated_value = processed_data.get('estimated_value', 0.0)
        return estimated_value

def user_interaction(bot: RealEstateValuationBot) -> Tuple[str, str]:
    """
    Handles interaction with the user

    Returns
    -------
    tuple
        A tuple containing the address and citystatezip provided by the user
    """
    address = input("Please enter the address of the property: ")
    citystatezip = input("Please enter the city and state zip of the property: ")

    data = bot.fetch_property_data(address, citystatezip)
    processed_data = bot.process_data(data)
    estimated_value = bot.evaluate_property(processed_data)

    logging.info(f"The estimated value of the property is: {estimated_value}")

    return address, citystatezip