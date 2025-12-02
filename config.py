"""Configuration settings for Polymarket Whale Transaction Notifier."""

import os

# Application info
APP_NAME = "PolyWhale"
APP_VERSION = "1.0.0"

# Polymarket API settings
POLYMARKET_API_BASE = "https://data-api.polymarket.com"
TRADES_ENDPOINT = f"{POLYMARKET_API_BASE}/trades"

# Whale transaction threshold (in USD)
WHALE_THRESHOLD = 10000

# Polling settings
POLL_INTERVAL_MINUTES = 5  # Check for new trades every 5 minutes
INITIAL_FETCH_HOURS = 24  # Try to fetch from last 24 hours on first run
FALLBACK_FETCH_DAYS = 7  # If no trades in 24hrs, fallback to 7 days

# Database settings
# Use user's data directory for database storage
DATA_DIR = os.path.join(os.path.expanduser("~"), ".local", "share", "polywhale")
os.makedirs(DATA_DIR, exist_ok=True)  # Create directory structure if it doesn't exist
DB_PATH = os.path.join(DATA_DIR, "whale_trades.db")

# Notification settings
NOTIFICATION_TIMEOUT = 5000  # 5 seconds
NOTIFICATION_ICON = "dialog-information"  # Generic info icon

# API request settings
API_TIMEOUT = 30  # seconds
MAX_RETRIES = 3
TRADES_LIMIT = 500  # Maximum trades to fetch per request

# Filter settings
FILTER_TYPE = "CASH"  # Filter by cash amount
FILTER_AMOUNT = WHALE_THRESHOLD

# UI settings
WINDOW_TITLE = APP_NAME
WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 700
