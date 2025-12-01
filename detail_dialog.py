"""Transaction detail dialog."""

from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QTextEdit, QGroupBox, QGridLayout
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from datetime import datetime
import json


class DetailDialog(QDialog):
    """Dialog to display detailed transaction information."""
    
    def __init__(self, transaction: dict, parent=None):
        """
        Initialize detail dialog.
        
        Args:
            transaction: Transaction data dictionary
            parent: Parent widget
        """
        super().__init__(parent)
        self.transaction = transaction
        self.init_ui()
        
    def init_ui(self):
        """Initialize UI components."""
        self.setWindowTitle("Whale Transaction Details")
        self.setMinimumWidth(700)
        self.setMinimumHeight(500)
        
        # Apply dark theme
        self.setStyleSheet("""
            QDialog {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
            QLabel {
                color: #e0e0e0;
                font-size: 13px;
            }
            QGroupBox {
                color: #e0e0e0;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
                margin-top: 10px;
                padding-top: 10px;
                font-size: 14px;
                font-weight: bold;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
            }
            QTextEdit {
                background-color: #2d2d2d;
                color: #e0e0e0;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 5px;
                font-family: monospace;
            }
            QPushButton {
                background-color: #3d3d3d;
                color: #e0e0e0;
                border: none;
                border-radius: 5px;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #4d4d4d;
            }
            QPushButton:pressed {
                background-color: #2d2d2d;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setSpacing(15)
        
        # Title
        title = QLabel("🐋 Whale Transaction Details")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title.setFont(title_font)
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)
        
        # Transaction Info Group
        tx_group = self._create_transaction_group()
        layout.addWidget(tx_group)
        
        # Market Info Group
        market_group = self._create_market_group()
        layout.addWidget(market_group)
        
        # Raw Details (expandable)
        details_group = self._create_details_group()
        layout.addWidget(details_group)
        
        # Buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()
        
        close_btn = QPushButton("Close")
        close_btn.clicked.connect(self.accept)
        button_layout.addWidget(close_btn)
        
        layout.addLayout(button_layout)
        
        self.setLayout(layout)
        
    def _create_transaction_group(self) -> QGroupBox:
        """Create transaction information group."""
        group = QGroupBox("Transaction Information")
        grid = QGridLayout()
        grid.setSpacing(10)
        
        # Amount
        amount_str = f"${self.transaction['amount']:,.2f}"
        self._add_field(grid, 0, "Amount:", amount_str, bold_value=True)
        
        # Side
        self._add_field(grid, 1, "Side:", self.transaction.get('side', 'N/A'))
        
        # Timestamp
        timestamp = self.transaction.get('timestamp', 0)
        if timestamp:
            time_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        else:
            time_str = 'N/A'
        self._add_field(grid, 2, "Timestamp:", time_str)
        
        # Transaction Hash
        tx_hash = self.transaction.get('tx_hash', 'N/A')
        self._add_field(grid, 3, "TX Hash:", tx_hash[:16] + "..." if len(tx_hash) > 16 else tx_hash)
        
        # Trader Address
        trader = self.transaction.get('trader_address', 'N/A')
        self._add_field(grid, 4, "Trader:", trader[:16] + "..." if len(trader) > 16 else trader)
        
        group.setLayout(grid)
        return group
        
    def _create_market_group(self) -> QGroupBox:
        """Create market information group."""
        group = QGroupBox("Market Information")
        grid = QGridLayout()
        grid.setSpacing(10)
        
        # Market Name
        market_name = self.transaction.get('market_name', 'N/A')
        self._add_field(grid, 0, "Market:", market_name)
        
        # Outcome
        outcome = self.transaction.get('outcome', 'N/A')
        self._add_field(grid, 1, "Outcome:", outcome)
        
        # Market ID
        market_id = self.transaction.get('market_id', 'N/A')
        if len(market_id) > 20:
            market_id = market_id[:20] + "..."
        self._add_field(grid, 2, "Market ID:", market_id)
        
        group.setLayout(grid)
        return group
        
    def _create_details_group(self) -> QGroupBox:
        """Create raw details group."""
        group = QGroupBox("Additional Details")
        layout = QVBoxLayout()
        
        # Parse JSON details
        details_json = self.transaction.get('details_json', '{}')
        try:
            if isinstance(details_json, str):
                details = json.loads(details_json)
            else:
                details = details_json
        except (json.JSONDecodeError, TypeError):
            details = {}
            
        # Show formatted JSON
        text_edit = QTextEdit()
        text_edit.setReadOnly(True)
        text_edit.setMaximumHeight(200)
        text_edit.setPlainText(json.dumps(details, indent=2))
        
        layout.addWidget(text_edit)
        group.setLayout(layout)
        return group
        
    def _add_field(self, grid: QGridLayout, row: int, label: str, value: str, bold_value: bool = False):
        """Add a label-value pair to grid."""
        label_widget = QLabel(label)
        label_font = QFont()
        label_font.setBold(True)
        label_widget.setFont(label_font)
        
        value_widget = QLabel(value)
        if bold_value:
            value_font = QFont()
            value_font.setBold(True)
            value_font.setPointSize(14)
            value_widget.setFont(value_font)
            value_widget.setStyleSheet("color: #4CAF50;")  # Green highlight for amount
            
        grid.addWidget(label_widget, row, 0, Qt.AlignRight)
        grid.addWidget(value_widget, row, 1)
