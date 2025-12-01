#!/usr/bin/env python3
"""Fix market IDs in database to use eventSlug instead of slug."""

import sqlite3
import json
from database import Database

def fix_market_ids():
    """Update all transactions to use eventSlug from details instead of slug."""
    db = Database()
    db.connect()
    
    # Get all transactions
    transactions = db.get_all_transactions()
    
    fixed_count = 0
    skipped_count = 0
    
    print(f"Found {len(transactions)} transactions to check...")
    
    for tx in transactions:
        try:
            # Parse the details JSON
            details = json.loads(tx['details_json']) if tx['details_json'] else {}
            
            # Get the eventSlug from details
            event_slug = details.get('event_slug')
            
            if event_slug and event_slug != tx['market_id']:
                # Update the market_id to use eventSlug
                db.cursor.execute(
                    'UPDATE whale_transactions SET market_id = ? WHERE id = ?',
                    (event_slug, tx['id'])
                )
                print(f"✓ Fixed TX {tx['tx_hash'][:10]}... : {tx['market_id']} → {event_slug}")
                fixed_count += 1
            else:
                skipped_count += 1
                
        except Exception as e:
            print(f"✗ Error processing transaction {tx['id']}: {e}")
    
    # Commit all changes
    db.conn.commit()
    db.close()
    
    print(f"\n{'='*60}")
    print(f"✓ Fixed {fixed_count} transactions")
    print(f"○ Skipped {skipped_count} transactions (already correct or missing eventSlug)")
    print(f"{'='*60}")

if __name__ == '__main__':
    fix_market_ids()
