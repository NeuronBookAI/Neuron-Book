from dotenv import load_dotenv
import os
from sanity import Client
import logging

load_dotenv()

def get_sanity_client():
    """Provides the connection to your Sanity database."""
    logger = logging.getLogger(__name__)
    
    return Client(
        logger, 
        project_id=os.getenv("SANITY_PROJECT_ID"),
        dataset="production",
        token=os.getenv("SANITY_WRITE_TOKEN"),
        use_cdn=False  # Set to False for write operations
    )