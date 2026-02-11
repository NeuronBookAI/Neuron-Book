from dotenv import load_dotenv
import os
from sanity import SanityClient

load_dotenv()

def get_sanity_client():
    """Provides the connection to your Sanity database."""
    return SanityClient(
        project_id=os.getenv("SANITY_PROJECT_ID"),
        dataset="production",
        token=os.getenv("SANITY_WRITE_TOKEN"),
        use_project_id=True
    )