"""Tests for database operations."""

import pytest
import os
import tempfile
from database import Database
from datetime import datetime


class TestDatabase:
    """Test cases for Database class."""
    
    def setup_method(self):
        """Set up test fixtures with temporary database."""
        # Create temporary database
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db_path = self.temp_db.name
        self.db = Database(self.db_path)
        self.db.connect()
        
    def teardown_method(self):
        """Clean up test fixtures."""
        self.db.close()
        # Remove temporary database
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)
            
    def test_database_initialization(self):
        """Test database and table creation."""
        # Check that tables exist
        cursor = self.db.cursor
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        assert 'whale_transactions' in tables
        assert 'settings' in tables
        
    def test_insert_transaction(self):
        """Test inserting a new transaction."""
        tx_data = {
            'tx_hash': '0xtest123',
            'amount': 15000.0,
            'market_name': 'Test Market',
            'market_id': 'market123',
            'outcome': 'Yes',
            'side': 'BUY',
            'trader_address': '0xtrader',
            'timestamp': int(datetime.now().timestamp()),
            'details': {'raw': 'data'}
        }
        
        result = self.db.insert_transaction(tx_data)
        assert result is True
        
        # Verify it was inserted
        count = self.db.get_transaction_count()
        assert count == 1
        
    def test_insert_duplicate_transaction(self):
        """Test that duplicate transactions are rejected."""
        tx_data = {
            'tx_hash': '0xtest123',
            'amount': 15000.0,
            'market_name': 'Test Market',
            'market_id': 'market123',
            'outcome': 'Yes',
            'side': 'BUY',
            'trader_address': '0xtrader',
            'timestamp': int(datetime.now().timestamp()),
            'details': {}
        }
        
        # Insert first time
        result1 = self.db.insert_transaction(tx_data)
        assert result1 is True
        
        # Try to insert again
        result2 = self.db.insert_transaction(tx_data)
        assert result2 is False
        
        # Should still only have 1 transaction
        count = self.db.get_transaction_count()
        assert count == 1
        
    def test_get_all_transactions(self):
        """Test retrieving all transactions."""
        # Insert multiple transactions
        for i in range(3):
            tx_data = {
                'tx_hash': f'0xtest{i}',
                'amount': 10000.0 + i * 1000,
                'market_name': f'Market {i}',
                'market_id': f'market{i}',
                'outcome': 'Yes',
                'side': 'BUY',
                'trader_address': '0xtrader',
                'timestamp': int(datetime.now().timestamp()) + i,
                'details': {}
            }
            self.db.insert_transaction(tx_data)
            
        transactions = self.db.get_all_transactions()
        
        assert len(transactions) == 3
        # Should be ordered by timestamp descending
        assert transactions[0]['timestamp'] >= transactions[1]['timestamp']
        
    def test_get_transaction_by_hash(self):
        """Test retrieving specific transaction by hash."""
        tx_data = {
            'tx_hash': '0xspecific',
            'amount': 20000.0,
            'market_name': 'Specific Market',
            'market_id': 'market_x',
            'outcome': 'No',
            'side': 'SELL',
            'trader_address': '0xtrader',
            'timestamp': int(datetime.now().timestamp()),
            'details': {}
        }
        
        self.db.insert_transaction(tx_data)
        
        # Retrieve by hash
        tx = self.db.get_transaction_by_hash('0xspecific')
        
        assert tx is not None
        assert tx['tx_hash'] == '0xspecific'
        assert tx['amount'] == 20000.0
        assert tx['market_name'] == 'Specific Market'
        
    def test_transaction_exists(self):
        """Test checking if transaction exists."""
        tx_data = {
            'tx_hash': '0xexists',
            'amount': 15000.0,
            'market_name': 'Test',
            'market_id': 'market1',
            'outcome': 'Yes',
            'side': 'BUY',
            'trader_address': '0xtrader',
            'timestamp': int(datetime.now().timestamp()),
            'details': {}
        }
        
        # Should not exist initially
        assert self.db.transaction_exists('0xexists') is False
        
        # Insert transaction
        self.db.insert_transaction(tx_data)
        
        # Should now exist
        assert self.db.transaction_exists('0xexists') is True
        
    def test_settings_get_set(self):
        """Test settings storage and retrieval."""
        # Set a setting
        self.db.set_setting('test_key', 'test_value')
        
        # Retrieve it
        value = self.db.get_setting('test_key')
        assert value == 'test_value'
        
        # Non-existent key
        value = self.db.get_setting('nonexistent')
        assert value is None
        
    def test_last_fetch_time(self):
        """Test last fetch time tracking."""
        # Should be None initially
        assert self.db.get_last_fetch_time() is None
        
        # Set last fetch time
        now = int(datetime.now().timestamp())
        self.db.set_last_fetch_time(now)
        
        # Retrieve it
        stored_time = self.db.get_last_fetch_time()
        assert stored_time == now
        
    def test_context_manager(self):
        """Test using database as context manager."""
        # Close current connection
        self.db.close()
        
        # Use context manager
        with Database(self.db_path) as db:
            tx_data = {
                'tx_hash': '0xcontext',
                'amount': 12000.0,
                'market_name': 'Context Test',
                'market_id': 'market_ctx',
                'outcome': 'Yes',
                'side': 'BUY',
                'trader_address': '0xtrader',
                'timestamp': int(datetime.now().timestamp()),
                'details': {}
            }
            db.insert_transaction(tx_data)
            
        # Verify data persisted
        with Database(self.db_path) as db:
            count = db.get_transaction_count()
            assert count == 1
