"""Main window for the application."""

from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTableWidget, QTableWidgetItem, QPushButton, QStatusBar,
    QHeaderView, QLabel, QMessageBox
)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QColor
from datetime import datetime
from typing import Optional
import config
from database import Database
from detail_dialog import DetailDialog


class MainWindow(QMainWindow):
    """Main application window."""
    
    def __init__(self, notifier_service=None):
        """
        Initialize main window.
        
        Args:
            notifier_service: Reference to notifier service for manual polling
        """
        super().__init__()
        self.db = Database()
        self.db.connect()
        self.notifier_service = notifier_service
        self.init_ui()
        self.load_transactions()
        
    def init_ui(self):
        """Initialize UI components."""
        self.setWindowTitle(config.WINDOW_TITLE)
        self.setGeometry(100, 100, config.WINDOW_WIDTH, config.WINDOW_HEIGHT)
        
        # Apply dark theme
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1e1e1e;
            }
            QWidget {
                background-color: #1e1e1e;
                color: #e0e0e0;
                font-size: 13px;
            }
            QTableWidget {
                background-color: #2d2d2d;
                alternate-background-color: #252525;
                gridline-color: #3d3d3d;
                color: #e0e0e0;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
            }
            QTableWidget::item {
                padding: 8px;
            }
            QTableWidget::item:selected {
                background-color: #4a4a4a;
            }
            QHeaderView::section {
                background-color: #3d3d3d;
                color: #e0e0e0;
                padding: 8px;
                border: none;
                font-weight: bold;
            }
            QPushButton {
                background-color: #3d3d3d;
                color: #e0e0e0;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #4d4d4d;
            }
            QPushButton:pressed {
                background-color: #2d2d2d;
            }
            QStatusBar {
                background-color: #2d2d2d;
                color: #a0a0a0;
                border-top: 1px solid #3d3d3d;
            }
            QLabel {
                color: #e0e0e0;
            }
        """)
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout()
        layout.setSpacing(10)
        layout.setContentsMargins(15, 15, 15, 15)
        
        # Header
        header_layout = QHBoxLayout()
        
        title = QLabel("🐋 Polymarket Whale Transactions")
        title_font = QFont()
        title_font.setPointSize(18)
        title_font.setBold(True)
        title.setFont(title_font)
        header_layout.addWidget(title)
        
        header_layout.addStretch()
        
        # Refresh button
        self.refresh_btn = QPushButton("🔄 Refresh")
        self.refresh_btn.clicked.connect(self.refresh_data)
        header_layout.addWidget(self.refresh_btn)
        
        layout.addLayout(header_layout)
        
        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels([
            "Timestamp", "Market", "Amount", "Side", "Outcome"
        ])
        
        # Configure table
        self.table.setAlternatingRowColors(True)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setSelectionMode(QTableWidget.SingleSelection)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.verticalHeader().setVisible(False)
        
        # Column widths
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.Stretch)
        header.setSectionResizeMode(2, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(3, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(4, QHeaderView.ResizeToContents)
        
        # Double-click to view details
        self.table.doubleClicked.connect(self.show_transaction_details)
        
        layout.addWidget(self.table)
        
        # Info label
        info_label = QLabel("💡 Double-click a row to view full transaction details")
        info_label.setStyleSheet("color: #a0a0a0; font-size: 11px;")
        layout.addWidget(info_label)
        
        central_widget.setLayout(layout)
        
        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.update_status_bar()
        
    def load_transactions(self):
        """Load transactions from database and populate table."""
        transactions = self.db.get_all_transactions()
        
        self.table.setRowCount(len(transactions))
        
        for row, tx in enumerate(transactions):
            # Timestamp
            timestamp = tx.get('timestamp', 0)
            if timestamp:
                time_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
            else:
                time_str = 'N/A'
            self.table.setItem(row, 0, QTableWidgetItem(time_str))
            
            # Market name
            market = tx.get('market_name', 'Unknown')
            self.table.setItem(row, 1, QTableWidgetItem(market))
            
            # Amount
            amount = tx.get('amount', 0)
            amount_item = QTableWidgetItem(f"${amount:,.2f}")
            amount_item.setForeground(QColor("#4CAF50"))  # Green
            amount_font = QFont()
            amount_font.setBold(True)
            amount_item.setFont(amount_font)
            self.table.setItem(row, 2, amount_item)
            
            # Side
            side = tx.get('side', 'N/A')
            side_item = QTableWidgetItem(side)
            if side == 'BUY':
                side_item.setForeground(QColor("#2196F3"))  # Blue
            elif side == 'SELL':
                side_item.setForeground(QColor("#FF9800"))  # Orange
            self.table.setItem(row, 3, side_item)
            
            # Outcome
            outcome = tx.get('outcome', 'N/A')
            self.table.setItem(row, 4, QTableWidgetItem(outcome))
            
            # Store full transaction data in row
            self.table.item(row, 0).setData(Qt.UserRole, tx)
            
        self.update_status_bar()
        
    def show_transaction_details(self):
        """Show detailed view for selected transaction."""
        selected_rows = self.table.selectedIndexes()
        if not selected_rows:
            return
            
        row = selected_rows[0].row()
        tx = self.table.item(row, 0).data(Qt.UserRole)
        
        if tx:
            dialog = DetailDialog(tx, self)
            dialog.exec_()
            
    def refresh_data(self):
        """Refresh transaction data."""
        self.refresh_btn.setEnabled(False)
        self.refresh_btn.setText("⏳ Refreshing...")
        
        # Trigger manual poll if service is available
        if self.notifier_service:
            try:
                self.notifier_service.poll_now()
            except Exception as e:
                QMessageBox.warning(
                    self,
                    "Refresh Error",
                    f"Failed to fetch new trades: {str(e)}"
                )
        
        # Reload table
        self.load_transactions()
        
        # Re-enable button after short delay
        QTimer.singleShot(1000, self._reset_refresh_button)
        
    def _reset_refresh_button(self):
        """Reset refresh button state."""
        self.refresh_btn.setEnabled(True)
        self.refresh_btn.setText("🔄 Refresh")
        
    def update_status_bar(self):
        """Update status bar with transaction count and last update."""
        count = self.table.rowCount()
        
        last_fetch = self.db.get_last_fetch_time()
        if last_fetch:
            last_fetch_str = datetime.fromtimestamp(last_fetch).strftime('%Y-%m-%d %H:%M:%S')
            status = f"Total: {count} whale transactions | Last updated: {last_fetch_str}"
        else:
            status = f"Total: {count} whale transactions"
            
        self.status_bar.showMessage(status)
        
    def closeEvent(self, event):
        """Handle window close event."""
        self.db.close()
        event.accept()
