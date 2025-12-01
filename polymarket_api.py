"""Polymarket API client for fetching whale transactions."""

import requests
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import config


class PolymarketAPI:
    """Client for interacting with Polymarket Data API."""
    
    def __init__(self):
        """Initialize API client."""
        self.base_url = config.POLYMARKET_API_BASE
        self.trades_endpoint = config.TRADES_ENDPOINT
        self.timeout = config.API_TIMEOUT
        self.max_retries = config.MAX_RETRIES
        
    def fetch_trades(
        self,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = config.TRADES_LIMIT
    ) -> List[Dict]:
        """
        Fetch whale trades from Polymarket API.
        
        Args:
            start_time: Start timestamp in seconds (optional)
            end_time: End timestamp in seconds (optional)
            limit: Maximum number of trades to fetch
            
        Returns:
            List of trade dictionaries
        """
        params = {
            'filterType': config.FILTER_TYPE,
            'filterAmount': config.FILTER_AMOUNT,
            'limit': limit,
            'sortBy': 'TIMESTAMP',
            'sortDirection': 'DESC'
        }
        
        if start_time:
            params['start'] = start_time
        if end_time:
            params['end'] = end_time
            
        # Retry logic
        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    self.trades_endpoint,
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Parse and normalize the response
                trades = self._parse_trades(data)
                return trades
                
            except requests.exceptions.RequestException as e:
                print(f"API request failed (attempt {attempt + 1}/{self.max_retries}): {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
                    
        return []
        
    def _parse_trades(self, data: List[Dict]) -> List[Dict]:
        """
        Parse and normalize trade data from API response.
        
        Args:
            data: Raw API response data
            
        Returns:
            List of normalized trade dictionaries
        """
        trades = []
        
        for trade in data:
            try:
                # Extract relevant fields
                normalized_trade = {
                    'tx_hash': trade.get('transactionHash', trade.get('id', '')),
                    'amount': float(trade.get('price', 0)) * float(trade.get('size', 0)),
                    'market_name': trade.get('title', 'Unknown Market'),  # Use 'title' field directly
                    'market_id': trade.get('eventSlug', trade.get('slug', '')),  # Use eventSlug for URL (event-level, not market-level)
                    'outcome': trade.get('outcome', ''),
                    'side': trade.get('side', 'UNKNOWN'),
                    'trader_address': trade.get('proxyWallet', trade.get('takerAddress', trade.get('makerAddress', ''))),
                    'timestamp': int(trade.get('timestamp', trade.get('matchTime', 0))),
                    'details': {
                        'price': trade.get('price'),
                        'size': trade.get('size'),
                        'fee_rate': trade.get('feeRateBps'),
                        'transaction_hash': trade.get('transactionHash'),
                        'bucket_index': trade.get('bucketIndex'),
                        'match_time': trade.get('matchTime'),
                        'slug': trade.get('slug'),
                        'event_slug': trade.get('eventSlug'),
                        'raw_data': trade  # Store complete raw data for reference
                    }
                }
                
                # Only include if we have required fields
                if normalized_trade['tx_hash'] and normalized_trade['amount'] > 0:
                    trades.append(normalized_trade)
                    
            except (KeyError, ValueError, TypeError) as e:
                print(f"Error parsing trade: {e}")
                continue
                
        return trades
        
    def fetch_initial_trades(self) -> List[Dict]:
        """
        Fetch initial trades on first run.
        Tries last 24 hours first, then falls back to 7 days if no results.
        
        Returns:
            List of trade dictionaries
        """
        now = int(datetime.now().timestamp())
        
        # Try last 24 hours
        start_24h = now - (config.INITIAL_FETCH_HOURS * 3600)
        print(f"Fetching trades from last {config.INITIAL_FETCH_HOURS} hours...")
        trades = self.fetch_trades(start_time=start_24h, end_time=now)
        
        if trades:
            print(f"Found {len(trades)} whale trades in last 24 hours")
            return trades
            
        # Fallback to 7 days
        print("No trades found in last 24 hours, trying last 7 days...")
        start_7d = now - (config.FALLBACK_FETCH_DAYS * 24 * 3600)
        trades = self.fetch_trades(start_time=start_7d, end_time=now)
        
        if trades:
            print(f"Found {len(trades)} whale trades in last 7 days")
        else:
            print("No whale trades found in last 7 days")
            
        return trades
        
    def fetch_new_trades(self, last_fetch_time: int) -> List[Dict]:
        """
        Fetch trades since the last fetch time.
        
        Args:
            last_fetch_time: Unix timestamp of last fetch
            
        Returns:
            List of new trade dictionaries
        """
        now = int(datetime.now().timestamp())
        
        print(f"Fetching new trades since {datetime.fromtimestamp(last_fetch_time)}")
        trades = self.fetch_trades(start_time=last_fetch_time, end_time=now)
        
        print(f"Found {len(trades)} new whale trades")
        return trades
