"""Background service for polling and notifications."""

import notify2
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from typing import Callable, Optional
import config
from database import Database
from polymarket_api import PolymarketAPI


class NotifierService:
    """Background service for polling Polymarket and sending notifications."""
    
    def __init__(self, on_new_trade: Optional[Callable] = None):
        """
        Initialize the notifier service.
        
        Args:
            on_new_trade: Optional callback when new trade is found
        """
        self.db = Database()
        # Don't connect here - will connect in start() to avoid cursor issues
        self.api = None  # Will initialize in start() with proper threshold
        
        self.scheduler = BackgroundScheduler()
        self.on_new_trade = on_new_trade
        self.is_running = False
        
        # Initialize notification system
        notify2.init(config.APP_NAME)
        
    def start(self):
        """Start the background service."""
        if self.is_running:
            print("Service already running")
            return
            
        print("Starting PolyWhale service...")
        
        # Connect to database
        self.db.connect()
        
        # Initialize API with threshold from database
        whale_threshold = self.db.get_whale_threshold()
        self.api = PolymarketAPI(whale_threshold=whale_threshold)
        
        # Check if first run
        last_fetch = self.db.get_last_fetch_time()
        
        if last_fetch is None:
            print("First run detected - fetching initial trades...")
            self._initial_fetch()
        else:
            print(f"Last fetch: {datetime.fromtimestamp(last_fetch)}")
            
        # Schedule polling job every N minutes
        self.scheduler.add_job(
            self._poll_trades,
            'interval',
            minutes=config.POLL_INTERVAL_MINUTES,
            id='poll_trades',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        print(f"Service started - polling every {config.POLL_INTERVAL_MINUTES} minutes")
        
    def _initial_fetch(self):
        """Fetch initial trades on first run."""
        try:
            trades = self.api.fetch_initial_trades()
            
            new_count = 0
            for trade in trades:
                if self.db.insert_transaction(trade):
                    new_count += 1
                    
            print(f"Initial fetch complete: {new_count} whale trades stored")
            
            # Update last fetch time
            now = int(datetime.now().timestamp())
            self.db.set_last_fetch_time(now)
            
            # Don't send notifications for initial fetch
            
        except Exception as e:
            print(f"Error during initial fetch: {e}")
            
    def _poll_trades(self):
        """Poll for new trades (scheduled job)."""
        print(f"Polling for new trades at {datetime.now()}")
        
        try:
            last_fetch = self.db.get_last_fetch_time()
            if last_fetch is None:
                # Shouldn't happen, but handle gracefully
                self._initial_fetch()
                return
                
            # Fetch new trades since last poll
            trades = self.api.fetch_new_trades(last_fetch)
            
            new_count = 0
            for trade in trades:
                if self.db.insert_transaction(trade):
                    new_count += 1
                    # Send notification for new trade
                    self._send_notification(trade)
                    
                    # Call callback if provided
                    if self.on_new_trade:
                        self.on_new_trade(trade)
                        
            if new_count > 0:
                print(f"Found {new_count} new whale trades")
            else:
                print("No new whale trades")
                
            # Update last fetch time
            now = int(datetime.now().timestamp())
            self.db.set_last_fetch_time(now)
            
        except Exception as e:
            print(f"Error during polling: {e}")
            
    def _send_notification(self, trade: dict):
        """
        Send desktop notification for a whale trade.
        
        Args:
            trade: Trade dictionary
        """
        try:
            # Format amount with commas
            amount_str = f"${trade['amount']:,.2f}"
            
            # Create notification title and body
            title = f"🐋 Whale Trade: {amount_str}"
            
            body = f"{trade['market_name']}\n"
            body += f"Side: {trade['side']}\n"
            body += f"Time: {datetime.fromtimestamp(trade['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}"
            
            # Send notification
            notification = notify2.Notification(
                title,
                body,
                config.NOTIFICATION_ICON
            )
            notification.set_timeout(config.NOTIFICATION_TIMEOUT)
            notification.show()
            
            print(f"Notification sent: {title}")
            
        except Exception as e:
            print(f"Error sending notification: {e}")
            
    def poll_now(self):
        """Manually trigger a poll for new trades."""
        print("Manual poll triggered")
        self._poll_trades()
        
    def update_threshold(self, amount: float):
        """Update the whale threshold dynamically.
        
        Args:
            amount: New threshold amount
        """
        print(f"Updating whale threshold to ${amount:,.2f}")
        self.api.whale_threshold = amount
        
    def stop(self):
        """Stop the background service."""
        if not self.is_running:
            return
            
        print("Stopping service...")
        self.scheduler.shutdown()
        self.db.close()
        self.is_running = False
        print("Service stopped")
        
    def get_status(self) -> dict:
        """Get service status information."""
        return {
            'is_running': self.is_running,
            'last_fetch': self.db.get_last_fetch_time() if self.db.conn else None,
            'total_trades': self.db.get_transaction_count() if self.db.conn else 0,
            'poll_interval': config.POLL_INTERVAL_MINUTES
        }
