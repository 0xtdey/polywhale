"""Main application entry point."""

import sys
import signal
from PyQt5.QtWidgets import QApplication, QSystemTrayIcon, QMenu, QAction
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QCoreApplication
from main_window import MainWindow
from notifier_service import NotifierService
import config


class PolymarketWhaleApp:
    """Main application class."""
    
    def __init__(self):
        """Initialize application."""
        self.app = QApplication(sys.argv)
        self.app.setApplicationName(config.APP_NAME)
        self.app.setApplicationVersion(config.APP_VERSION)
        
        # Allow Ctrl+C to work
        signal.signal(signal.SIGINT, signal.SIG_DFL)
        
        self.notifier_service = None
        self.main_window = None
        self.tray_icon = None
        
    def run(self):
        """Run the application."""
        print(f"Starting {config.APP_NAME} v{config.APP_VERSION}")
        
        # Start background service
        self.notifier_service = NotifierService(on_new_trade=self.on_new_trade)
        self.notifier_service.start()
        
        # Create system tray icon
        self.create_tray_icon()
        
        # Create main window (hidden initially)
        self.main_window = MainWindow(self.notifier_service)
        
        # Show main window immediately for now
        # Later this can be changed to only show on tray click
        self.main_window.show()
        
        print("Application started successfully")
        print(f"Monitoring for trades over ${config.WHALE_THRESHOLD:,.2f}")
        print(f"Polling every {config.POLL_INTERVAL_MINUTES} minutes")
        
        # Run Qt event loop
        sys.exit(self.app.exec_())
        
    def create_tray_icon(self):
        """Create system tray icon with menu."""
        # Create tray icon
        self.tray_icon = QSystemTrayIcon(self.app)
        
        # Use a simple text icon (can be replaced with actual icon file)
        # For now, we'll use the default application icon
        self.tray_icon.setToolTip(config.APP_NAME)
        
        # Create menu
        menu = QMenu()
        
        # Show window action
        show_action = QAction("Show Window", self.app)
        show_action.triggered.connect(self.show_window)
        menu.addAction(show_action)
        
        # Refresh action
        refresh_action = QAction("Check Now", self.app)
        refresh_action.triggered.connect(self.manual_refresh)
        menu.addAction(refresh_action)
        
        menu.addSeparator()
        
        # Status action (disabled, just for info)
        status_action = QAction("Service Running", self.app)
        status_action.setEnabled(False)
        menu.addAction(status_action)
        
        menu.addSeparator()
        
        # Quit action
        quit_action = QAction("Quit", self.app)
        quit_action.triggered.connect(self.quit_app)
        menu.addAction(quit_action)
        
        self.tray_icon.setContextMenu(menu)
        
        # Double-click to show window
        self.tray_icon.activated.connect(self.on_tray_activated)
        
        # Show tray icon
        self.tray_icon.show()
        
    def on_tray_activated(self, reason):
        """Handle tray icon activation."""
        if reason == QSystemTrayIcon.DoubleClick:
            self.show_window()
            
    def show_window(self):
        """Show main window."""
        if self.main_window:
            self.main_window.show()
            self.main_window.activateWindow()
            self.main_window.raise_()
            
    def manual_refresh(self):
        """Manually trigger a refresh."""
        if self.notifier_service:
            self.notifier_service.poll_now()
            
        # Also refresh window if it exists
        if self.main_window:
            self.main_window.load_transactions()
            
    def on_new_trade(self, trade: dict):
        """
        Callback when new trade is detected.
        
        Args:
            trade: Trade dictionary
        """
        # Refresh main window if it's open
        if self.main_window and self.main_window.isVisible():
            self.main_window.load_transactions()
            
    def quit_app(self):
        """Quit the application."""
        print("Shutting down...")
        
        # Stop notifier service
        if self.notifier_service:
            self.notifier_service.stop()
            
        # Close main window
        if self.main_window:
            self.main_window.close()
            
        # Quit application
        QCoreApplication.quit()


def main():
    """Main entry point."""
    app = PolymarketWhaleApp()
    app.run()


if __name__ == '__main__':
    main()
