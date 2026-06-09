import os
import requests
import logging
from typing import List, Dict
from requests.exceptions import HTTPError

class APIKeyMissingError(Exception):
    """Raised when the API Key is missing"""
    pass

class InvalidImageDataError(Exception):
    """Raised when the image data is invalid"""
    pass

class WhatsAppImageBackupAgent:
    """
    Agent to extract images from a WhatsApp group and save them in OneDrive
    """
    
    def __init__(self):
        """
        Initialize the WhatsAppImageBackupAgent with the necessary API keys
        """
        try:
            self.whatsapp_api_key = os.environ['WHATSAPP_API_KEY']
            self.onedrive_api_key = os.environ['ONEDRIVE_API_KEY']
            
            if not self.whatsapp_api_key or not self.onedrive_api_key:
                raise APIKeyMissingError("API Key missing in the environment variable")
        except KeyError as e:
            logging.error(f"Missing API Key: {e}")
            raise APIKeyMissingError("API Key not found in the environment variables") from e

    def validate_images(self, images: List[Dict[str, str]]):
        """
        Validate the 'images' input

        :param images: A list of images with their metadata
        """
        if not isinstance(images, list) or not all(isinstance(i, dict) for i in images):
            raise InvalidImageDataError("Invalid images")

        # TODO: Add more specific image data validation here
        # e.g. check the format and content of the data in the 'images' list elements

    # Implement the API interactions as per the feedback
    def get_images_from_whatsapp(self, group_id: str) -> List[Dict[str, str]]:
        """
        Extract images from a specified WhatsApp group

        :param group_id: The ID of the WhatsApp group from which to extract images
        :return: A list of images with their metadata
        """
        if not isinstance(group_id, str) or not group_id:
            raise ValueError("Invalid group_id")

        try:
            # TODO: Implement the actual API calls to WhatsApp Business API using the provided API key and group_id
            # Placeholder for the API call
            response = requests.get(f"https://api.whatsapp.com/{self.whatsapp_api_key}/{group_id}")
            response.raise_for_status()
            return response.json()
        except HTTPError as http_err:
            logging.error(f"HTTP error occurred while getting images from WhatsApp: {http_err}")
            return []
        except Exception as err:
            logging.error(f"Failed to get images from WhatsApp: {err}")
            return []

    def save_images_to_onedrive(self, images: List[Dict[str, str]]) -> bool:
        """
        Save a list of images to OneDrive

        :param images: A list of images with their metadata to save to OneDrive
        :return: True if successful, False otherwise
        """
        self.validate_images(images)

        try:
            # TODO: Implement the actual API calls to OneDrive (Microsoft Graph API) using the provided API key and images
            # Placeholder for the API call
            response = requests.post(f"https://api.onedrive.com/{self.onedrive_api_key}", data=images)
            response.raise_for_status()
            return True
        except HTTPError as http_err:
            logging.error(f"HTTP error occurred while saving images to OneDrive: {http_err}")
            return False
        except Exception as err:
            logging.error(f"Failed to save images to OneDrive: {err}")
            return False

    def sort_images(self, images: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Sort a list of images based on some criteria

        :param images: A list of images with their metadata to sort
        :return: A sorted list of images with their metadata
        """
        self.validate_images(images)

        try:
            # TODO: Implement the sorting algorithm
            # Placeholder for the sorting algorithm
            return sorted(images, key=lambda x: x['metadata'])
        except Exception as e:
            logging.error(f"Failed to sort images: {e}")
            return []

    def backup_images(self, group_id: str) -> bool:
        """
        Backup images from a specified WhatsApp group to OneDrive

        :param group_id: The ID of the WhatsApp group from which to backup images
        :return: True if successful, False otherwise
        """
        images = self.get_images_from_whatsapp(group_id)
        if images:
            sorted_images = self.sort_images(images)
            return self.save_images_to_onedrive(sorted_images)
        return False