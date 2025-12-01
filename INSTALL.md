# PolyWhale - Installation Guide

Monitor Polymarket whale transactions (trades over $10,000) with desktop notifications.

## Download & Install

### For Debian/Ubuntu Users

1. **Download the .deb package:**
   - Get `polywhale_2.0.0_amd64.deb` from releases

2. **Install:**
   ```bash
   sudo dpkg -i polywhale_2.0.0_amd64.deb
   ```

3. **If you get dependency errors:**
   ```bash
   sudo apt-get install -f
   ```

4. **Launch the app:**
   - Find "PolyWhale" in your Applications menu
   - Or run from terminal: `polywhale`

## What It Does

- 🐋 Monitors Polymarket for trades over $10,000
- 🔔 Desktop notifications for new whale trades
- 📊 Clean card-based UI to view transaction history
- 📅 Dates in dd/mm/yyyy format
- ⏱️ Auto-refreshes every minute
- 💾 Select 10, 20, or 30 latest transactions to display

## Requirements

- Ubuntu 20.04+ / Debian 11+
- Python 3.8+
- Internet connection

## Features

### Simple UI
- Card-based feed (not a complex trading terminal)
- Click any card to expand for full details
- Copy transaction hash with confirmation
- Open market directly on Polymarket

### Smart Display
- Dropdown to show 10, 20, or 30 latest transactions
- Always shows the NEWEST trades
- Your preference is remembered

## Uninstall

```bash
sudo dpkg -r polywhale
```

## Troubleshooting

**App won't start?**
- Make sure Python 3 is installed: `python3 --version`
- Install from terminal to see errors: `polywhale`

**No transactions showing?**
- Wait 30 seconds for backend to start
- Check if port 5000 is available

**Python dependency issues?**
```bash
pip3 install --user requests flask flask-cors apscheduler notify2 dbus-python
```

## Building From Source

See main README.md in the repository.

## License

Educational/personal use.
