"""Database manager for storing whale transactions."""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import config


class Database:
    """Manage SQLite database for whale transactions."""
    
    def __init__(self, db_path: str = config.DB_PATH):
        """Initialize database connection."""
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Connect to database and initialize schema."""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row  # Access columns by name
        self._create_tables()
        
    def _create_tables(self):
        """Create database tables if they don't exist."""
        cursor = self.conn.cursor()
        
        # Whale transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS whale_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_hash TEXT UNIQUE NOT NULL,
                amount REAL NOT NULL,
                market_name TEXT,
                market_id TEXT,
                outcome TEXT,
                side TEXT,
                trader_address TEXT,
                timestamp INTEGER NOT NULL,
                details_json TEXT,
                created_at INTEGER NOT NULL
            )
        ''')
        
        # Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        ''')
        
        self.conn.commit()
        cursor.close()
        
    def insert_transaction(self, tx_data: Dict) -> bool:
        """
        Insert a new whale transaction.
        
        Args:
            tx_data: Dictionary containing transaction details
            
        Returns:
            True if inserted, False if duplicate
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO whale_transactions (
                    tx_hash, amount, market_name, market_id, outcome,
                    side, trader_address, timestamp, details_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                tx_data.get('tx_hash'),
                tx_data.get('amount'),
                tx_data.get('market_name'),
                tx_data.get('market_id'),
                tx_data.get('outcome'),
                tx_data.get('side'),
                tx_data.get('trader_address'),
                tx_data.get('timestamp'),
                json.dumps(tx_data.get('details', {})),
                int(datetime.now().timestamp())
            ))
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            # Duplicate tx_hash
            return False
        finally:
            cursor.close()
            
    def get_all_transactions(self, limit: Optional[int] = None) -> List[Dict]:
        """
        Get all whale transactions, ordered by timestamp descending.
        
        Args:
            limit: Optional limit on number of results
            
        Returns:
            List of transaction dictionaries
        """
        cursor = self.conn.cursor()
        try:
            query = '''
                SELECT * FROM whale_transactions 
                ORDER BY timestamp DESC
            '''
            if limit:
                query += f' LIMIT {limit}'
                
            cursor.execute(query)
            rows = cursor.fetchall()
            
            # Manually convert rows to dicts to ensure proper serialization
            transactions = []
            for row in rows:
                tx = {
                    'id': row['id'],
                    'tx_hash': row['tx_hash'],
                    'amount': float(row['amount']) if row['amount'] else 0,
                    'market_name': row['market_name'],
                    'market_id': row['market_id'],
                    'outcome': row['outcome'],
                    'side': row['side'],
                    'trader_address': row['trader_address'],
                    'timestamp': int(row['timestamp']) if row['timestamp'] else 0,
                    'details_json': row['details_json'],
                    'created_at': int(row['created_at']) if row['created_at'] else 0
                }
                transactions.append(tx)
                
            return transactions
        finally:
            cursor.close()
        
    def get_transaction_by_hash(self, tx_hash: str) -> Optional[Dict]:
        """
        Get a specific transaction by its hash.
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Transaction dictionary or None
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'SELECT * FROM whale_transactions WHERE tx_hash = ?',
                (tx_hash,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            cursor.close()
        
    def transaction_exists(self, tx_hash: str) -> bool:
        """
        Check if a transaction already exists.
        
        Args:
            tx_hash: Transaction hash to check
            
        Returns:
            True if exists, False otherwise
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'SELECT 1 FROM whale_transactions WHERE tx_hash = ? LIMIT 1',
                (tx_hash,)
            )
            return cursor.fetchone() is not None
        finally:
            cursor.close()
        
    def get_setting(self, key: str) -> Optional[str]:
        """Get a setting value."""
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
            row = cursor.fetchone()
            return row['value'] if row else None
        finally:
            cursor.close()
        
    def set_setting(self, key: str, value: str):
        """Set or update a setting value."""
        cursor = self.conn.cursor()
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value)
                VALUES (?, ?)
            ''', (key, value))
            self.conn.commit()
        finally:
            cursor.close()
        
    def get_last_fetch_time(self) -> Optional[int]:
        """Get the last time trades were fetched."""
        value = self.get_setting('last_fetch_time')
        return int(value) if value else None
        
    def set_last_fetch_time(self, timestamp: int):
        """Set the last fetch time."""
        self.set_setting('last_fetch_time', str(timestamp))
        
    def get_transaction_count(self) -> int:
        """Get total count of stored transactions."""
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT COUNT(*) as count FROM whale_transactions')
            return cursor.fetchone()['count']
        finally:
            cursor.close()
        
    def get_whale_threshold(self) -> float:
        """Get the whale threshold from settings or return default."""
        import config
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'SELECT value FROM settings WHERE key = ?',
                ('whale_threshold',)
            )
            result = cursor.fetchone()
            return float(result['value']) if result else config.WHALE_THRESHOLD
        except Exception:
            return config.WHALE_THRESHOLD
        finally:
            cursor.close()
        
    def set_whale_threshold(self, amount: float):
        """Set the whale threshold."""
        self.set_setting('whale_threshold', str(amount))
        
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
