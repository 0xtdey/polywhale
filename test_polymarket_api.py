"""Tests for Polymarket API client."""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime
from polymarket_api import PolymarketAPI
import config


class TestPolymarketAPI:
    """Test cases for PolymarketAPI class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.api = PolymarketAPI()
        
    def test_initialization(self):
        """Test API client initialization."""
        assert self.api.base_url == config.POLYMARKET_API_BASE
        assert self.api.trades_endpoint == config.TRADES_ENDPOINT
        assert self.api.timeout == config.API_TIMEOUT
        
    @patch('polymarket_api.requests.get')
    def test_fetch_trades_success(self, mock_get):
        """Test successful trade fetching."""
        # Mock API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                'id': 'test123',
                'transactionHash': '0xabc123',
                'price': '0.5',
                'size': '25000',
                'side': 'BUY',
                'timestamp': 1700000000,
                'market': {
                    'question': 'Test Market?',
                    'conditionId': 'market123'
                },
                'outcome': 'Yes',
                'takerAddress': '0xtrader123'
            }
        ]
        mock_get.return_value = mock_response
        
        # Fetch trades
        trades = self.api.fetch_trades()
        
        # Assertions
        assert len(trades) == 1
        assert trades[0]['tx_hash'] == '0xabc123'
        assert trades[0]['amount'] == 12500.0  # 0.5 * 25000
        assert trades[0]['side'] == 'BUY'
        assert trades[0]['market_name'] == 'Test Market?'
        
    @patch('polymarket_api.requests.get')
    def test_fetch_trades_api_error(self, mock_get):
        """Test handling of API errors."""
        mock_get.side_effect = Exception("API Error")
        
        with pytest.raises(Exception):
            self.api.fetch_trades()
            
    def test_parse_trades_empty_list(self):
        """Test parsing empty trade list."""
        trades = self.api._parse_trades([])
        assert trades == []
        
    def test_parse_trades_missing_fields(self):
        """Test parsing trades with missing required fields."""
        incomplete_trade = {
            'id': 'test123',
            'price': '0.5'
            # Missing size, market, etc.
        }
        
        trades = self.api._parse_trades([incomplete_trade])
        # Should skip invalid trades
        assert len(trades) == 0
        
    @patch('polymarket_api.requests.get')
    def test_fetch_initial_trades_24hr(self, mock_get):
        """Test initial fetch tries 24 hours first."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                'id': 'test123',
                'transactionHash': '0xabc',
                'price': '0.5',
                'size': '25000',
                'side': 'BUY',
                'timestamp': int(datetime.now().timestamp()),
                'market': {'question': 'Test', 'conditionId': 'm1'},
                'outcome': 'Yes',
                'takerAddress': '0xtrader'
            }
        ]
        mock_get.return_value = mock_response
        
        trades = self.api.fetch_initial_trades()
        
        # Should have called API once (24hr fetch succeeded)
        assert mock_get.call_count == 1
        assert len(trades) == 1
        
    @patch('polymarket_api.requests.get')
    def test_fetch_initial_trades_fallback_7days(self, mock_get):
        """Test initial fetch falls back to 7 days if no 24hr results."""
        mock_response_empty = Mock()
        mock_response_empty.status_code = 200
        mock_response_empty.json.return_value = []
        
        mock_response_7d = Mock()
        mock_response_7d.status_code = 200
        mock_response_7d.json.return_value = [
            {
                'id': 'test123',
                'transactionHash': '0xabc',
                'price': '0.5',
                'size': '25000',
                'side': 'BUY',
                'timestamp': int(datetime.now().timestamp()),
                'market': {'question': 'Test', 'conditionId': 'm1'},
                'outcome': 'Yes',
                'takerAddress': '0xtrader'
            }
        ]
        
        # First call returns empty, second returns data
        mock_get.side_effect = [mock_response_empty, mock_response_7d]
        
        trades = self.api.fetch_initial_trades()
        
        # Should have called API twice (24hr + 7day)
        assert mock_get.call_count == 2
        assert len(trades) == 1
