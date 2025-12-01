# PolyWhale

Simple desktop app to monitor whale transactions on Polymarket.

## Quick Start

**Just double-click to run:**
```bash
./start-app.sh
```

That's it! The app will open automatically.

## First Time Setup

1. Make sure Python dependencies are installed:
   ```bash
   pip install requests PyQt5 notify2 apscheduler dbus-python flask flask-cors
   ```

2. Run the app:
   ```bash
   ./start-app.sh
   ```

## What It Does

- 🐋 Monitors Polymarket for trades over $10,000
- 🔔 Shows desktop notifications for new whale trades
- 📊 Clean card-based UI to view all transactions
- 📅 Dates in dd/mm/yyyy format
- ⏰ Auto-refreshes every minute

## UI

Simple, clean card design - not a complex trading terminal:

```
🐋 PolyWhale         ● Running

🐋 $86,668 SELL
Jurassic World: Rebirth...
01/12/2024 12:05

🐋 $11,020 BUY  
Portugal presidential...
01/12/2024 12:04
```

Click any card to see full details.

## Troubleshooting

**App won't start?**
- Make sure `start-app.sh` is executable: `chmod +x start-app.sh`
- Install Python dependencies (see above)

**No transactions showing?**
- Wait 30 seconds for backend to start
- Backend runs on http://localhost:5000

## Configuration

Edit `config.py` to change:
- Whale threshold (default: $10,000)
- Polling interval (default: 5 minutes)
