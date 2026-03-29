
import os
from dotenv import load_dotenv

def load_env():
    """Loads environment variables from a .env file."""
    load_dotenv()

def require_keys(keys):
    """
    Checks if all required environment variables are set.
    Raises a SystemExit if any key is missing.
    """
    missing_keys = [key for key in keys if not os.getenv(key)]
    if missing_keys:
        print("Error: Missing required environment variables:")
        for key in missing_keys:
            print(f"  - {key}")
        print("Please make sure they are defined in your .env file.")
        raise SystemExit(1)
