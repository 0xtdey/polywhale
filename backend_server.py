"""Flask API server for Electron frontend."""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import threading
from database import Database
from polymarket_api import PolymarketAPI
from notifier_service import NotifierService

app = Flask(__name__)
CORS(app)  # Enable CORS for Electron

# Global instances
db = Database()
print("Connecting to database...")
db.connect()  # Connect immediately
print(f"Database connected. Transaction count: {db.get_transaction_count()}")
api_client = PolymarketAPI()
notifier = None

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all whale transactions."""
    try:
        # Get limit from query parameter, default to 100
        limit = request.args.get('limit', default=100, type=int)
        
        # Ensure limit is reasonable (between 1 and 500)
        limit = max(1, min(500, limit))
        
        transactions = db.get_all_transactions(limit=limit)
        return jsonify({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        })
    except Exception as e:
        import traceback
        print(f"ERROR in /api/transactions: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get service status."""
    try:
        status = notifier.get_status() if notifier else {
            'is_running': False,
            'last_fetch': None,
            'total_trades': 0,
            'poll_interval': 5
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/refresh', methods=['POST'])
def trigger_refresh():
    """Manually trigger a refresh."""
    try:
        if notifier:
            notifier.poll_now()
            
        return jsonify({
            'success': True,
            'message': 'Refresh triggered'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/threshold', methods=['GET'])
def get_threshold():
    """Get current whale threshold."""
    try:
        threshold = db.get_whale_threshold()
        return jsonify({
            'success': True,
            'threshold': threshold
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/threshold', methods=['POST'])
def update_threshold():
    """Update whale threshold."""
    try:
        data = request.get_json()
        amount = data.get('amount')
        
        if amount is None:
            return jsonify({
                'success': False,
                'error': 'Amount is required'
            }), 400
            
        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, TypeError) as e:
            return jsonify({
                'success': False,
                'error': 'Invalid amount: must be a positive number'
            }), 400
        
        # Update threshold in database
        db.set_whale_threshold(amount)
        
        # Update notifier service if running
        if notifier:
            notifier.update_threshold(amount)
        
        return jsonify({
            'success': True,
            'threshold': amount,
            'message': 'Threshold updated successfully'
        })
    except Exception as e:
        import traceback
        print(f"ERROR in /api/threshold POST: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def start_notifier_service():
    """Start the background notifier service."""
    global notifier
    notifier = NotifierService()
    notifier.start()

def main():
    """Run the Flask server."""
    print("Starting PolyWhale Backend...")
    print("API Server: http://localhost:5000")
    
    # Start notifier service in background thread
    notifier_thread = threading.Thread(target=start_notifier_service, daemon=True)
    notifier_thread.start()
    
    # Run Flask app
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

if __name__ == '__main__':
    main()
