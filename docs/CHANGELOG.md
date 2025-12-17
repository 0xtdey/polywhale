# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-12-04

### 🚀 New Features
- **Configurable Whale Threshold:** Users can now customize the whale transaction amount directly from the UI (default: $10,000).
- **Persistent Settings:** Threshold preference is saved and persists across app restarts.

### 🔧 Improvements
- Enhanced database thread safety for better multi-threaded performance.
- Improved API response handling and error messages.

## [2.0.0] - 2025-12-03

### 🚀 New Features
- **Standalone App:** Fully bundled application with embedded Python backend - no external dependencies required.
- **Enhanced UI:** Improved layout, spacing, and visual feedback.
- **Market Filtering:** Filter transactions by market type (Crypto, Politics, etc.).

### 🐛 Bug Fixes
- Fixed missing application icon on Linux.
- Resolved "View on Polymarket" broken links.
- Fixed backend port conflicts and startup stability.
- Optimized application size and performance.
