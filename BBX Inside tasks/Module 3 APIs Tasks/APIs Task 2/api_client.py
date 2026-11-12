import os
from dotenv import load-dotenv

# Load environment variables from .env file
load_dotenv()

class APIClient:
    def __init__(self, base_url, require_api_key=False, **kwargs):
        self.base_url = base_url
        self.require_api_key = require_api_key
        
        # Check for GitHub token if required
        self.github_token = os.getenv("GITHUB_TOKEN")
        if self.require_api_key and not self.github_token:
            raise RuntimeError("GITHUB_TOKEN is missing. Add it to your .env file.")