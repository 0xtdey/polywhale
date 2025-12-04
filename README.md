# 🐋 PolyWhale
<img width="1970" height="512" alt="icon (1)" src="https://github.com/user-attachments/assets/9c15d514-94d0-42cd-8b65-c120e4e6f85f" />

**Simple desktop app to monitor whale transactions on Polymarket.**

PolyWhale sits quietly in your background and notifies you whenever a "whale" transaction occurs on Polymarket. Choose your own threshold amount (default: $10,000) and get instant notifications when big trades happen.

## ✨ Features

- 🐋 **Real-time Monitoring**: Checks for whale trades every 5 minutes.
- ⚙️ **Configurable Threshold**: Set your own whale amount (default: $10,000) directly from the app.
- 🔔 **Desktop Notifications**: Get instant alerts for big moves.
- 📊 **Clean UI**: Simple card-based feed, not a complex trading terminal.
- 📅 **History**: View past whale transactions with dates in dd/mm/yyyy format.
- 🚀 **Smart Display**: Choose to see the latest 10, 20, or 30 transactions.
- 🔗 **Direct Links**: Click any card to view the market on Polymarket.

## 📥 Download & Install

### For Debian/Ubuntu Users

1. **Download the .deb package:**
   - Get the latest `polywhale_x.x.x_amd64.deb` from the [Releases page](https://github.com/YOUR_USERNAME/polywhale/releases).

2. **Install:**
   ```bash
   sudo dpkg -i polywhale_2.1.0_amd64.deb
   ```

3. **Fix dependencies (if needed):**
   If you see any error messages about missing dependencies:
   ```bash
   sudo apt-get install -f
   ```

4. **Launch:**
   - Find **PolyWhale** in your Applications menu.
   - Or run from terminal: `polywhale`

### For Developers (Run from Source)

If you want to run the app from source code:

1. **Install Python dependencies:**
   ```bash
   pip install requests PyQt5 notify2 apscheduler dbus-python flask flask-cors
   ```

2. **Run the app:**
   ```bash
   ./start-app.sh
   ```

## 🗑️ Uninstall

To remove PolyWhale from your system:

```bash
sudo dpkg -r polywhale
```

## 🔧 Configuration

### Whale Threshold
You can customize the whale transaction threshold directly from the app interface:
1. Launch PolyWhale
2. In the header, find the **"Whale Threshold ($)"** input
3. Enter your desired amount (e.g., 5000 for $5,000 transactions)
4. Click **"Update"**
5. Your preference is automatically saved and persists across restarts

*For source installations:*
You can also customize other settings by editing `config.py`:
- **Polling Interval**: Change how often it checks for new trades (default: 5 minutes).

## ❓ Troubleshooting

**App won't start?**
- Ensure you have Python 3.8+ installed.
- If running from source, make sure `start-app.sh` is executable: `chmod +x start-app.sh`.

**No transactions showing?**
- The app waits about 30 seconds for the backend to initialize.
- Ensure you have an active internet connection.
- The backend runs on `http://localhost:5000`.

---

*Educational/personal use only.*
