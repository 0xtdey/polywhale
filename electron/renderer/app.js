// API Configuration
const API_BASE = 'http://localhost:5000/api';

// State
let transactions = [];
let expandedCardId = null;
let transactionLimit = 10; // Default to 10

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load saved limit preference or default to 10
    const savedLimit = localStorage.getItem('txLimit');
    if (savedLimit) {
        transactionLimit = parseInt(savedLimit);
        document.getElementById('tx-limit').value = savedLimit;
    }

    // Load saved theme preference
    initializeTheme();

    loadTransactions();
    setupEventListeners();

    // Auto-refresh every minute
    setInterval(loadTransactions, 60000);
});

// Setup event listeners
function setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="refresh-icon">⏳</span> Refreshing...';

        triggerManualRefresh().then(() => {
            setTimeout(() => {
                loadTransactions();
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<span class="refresh-icon">🔄</span> Refresh';
            }, 2000);
        });
    });

    // Transaction limit dropdown
    const limitDropdown = document.getElementById('tx-limit');
    limitDropdown.addEventListener('change', (e) => {
        transactionLimit = parseInt(e.target.value);
        localStorage.setItem('txLimit', transactionLimit);
        loadTransactions(); // Reload with new limit
    });

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);


    // Listen for tray menu refresh
    if (window.electronAPI) {
        window.electronAPI.onRefresh(() => {
            loadTransactions();
        });
    }
}

// Load transactions from API
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions?limit=${transactionLimit}`);
        const data = await response.json();

        transactions = data.transactions || [];
        renderTransactions();
        updateTimestamp();

    } catch (error) {
        console.error('Failed to load transactions:', error);
        showError();
    }
}

// Trigger manual refresh via API
async function triggerManualRefresh() {
    try {
        await fetch(`${API_BASE}/refresh`, { method: 'POST' });
    } catch (error) {
        console.error('Failed to trigger refresh:', error);
    }
}

// Render transactions
function renderTransactions() {
    const loadingEl = document.getElementById('loading');
    const emptyEl = document.getElementById('empty-state');
    const listEl = document.getElementById('transactions-list');

    // Hide loading
    loadingEl.style.display = 'none';

    if (transactions.length === 0) {
        emptyEl.style.display = 'block';
        listEl.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    listEl.style.display = 'block';

    // Clear existing
    listEl.innerHTML = '';

    // Render each transaction as a card
    transactions.forEach(tx => {
        const card = createTransactionCard(tx);
        listEl.appendChild(card);
    });
}

// Create transaction card element
function createTransactionCard(tx) {
    const card = document.createElement('div');
    card.className = 'transaction-card';
    card.dataset.txHash = tx.tx_hash;

    // Format data
    const amount = formatAmount(tx.amount);
    const date = formatDate(tx.timestamp);
    const side = tx.side || 'UNKNOWN';
    const sideClass = side.toLowerCase() === 'buy' ? 'side-buy' : 'side-sell';

    card.innerHTML = `
        <div class="card-header">
            <div class="card-amount">
                <span class="whale-icon">🐋</span>
                ${amount}
            </div>
            <div class="card-side ${sideClass}">${side}</div>
        </div>
        <div class="card-market">${escapeHtml(tx.market_name || 'Unknown Market')}</div>
        <div class="card-date">${date}</div>
        
        <div class="card-details">
            <div class="detail-row">
                <span class="detail-label">Outcome:</span>
                <span class="detail-value">${escapeHtml(tx.outcome || 'N/A')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Trader:</span>
                <span class="detail-value">${shortenAddress(tx.trader_address)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">TX Hash:</span>
                <span class="detail-value">${shortenHash(tx.tx_hash)}</span>
            </div>
            <div class="detail-actions">
                <button class="detail-btn" onclick="copyToClipboard('${tx.tx_hash}')">
                    Copy TX Hash
                </button>
                <button class="detail-btn" onclick="openPolymarket('${tx.market_id}')">
                    View on Polymarket
                </button>
            </div>
        </div>
    `;

    // Click to expand/collapse
    card.addEventListener('click', (e) => {
        // Don't toggle if clicking a button
        if (e.target.tagName === 'BUTTON') return;

        const isExpanded = card.classList.contains('expanded');

        // Collapse all cards
        document.querySelectorAll('.transaction-card').forEach(c => {
            c.classList.remove('expanded');
        });

        // Expand this card if it wasn't already expanded
        if (!isExpanded) {
            card.classList.add('expanded');
        }
    });

    return card;
}

// Format amount as currency
function formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date as dd/mm/yyyy HH:MM
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';

    const date = new Date(timestamp * 1000);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Shorten address
function shortenAddress(address) {
    if (!address) return 'N/A';
    if (address.length < 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// Shorten hash
function shortenHash(hash) {
    if (!hash) return 'N/A';
    if (hash.length < 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('last-update-time').textContent = timeStr;
}

// Copy to clipboard with visual feedback
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show confirmation by changing button style temporarily
        const buttons = document.querySelectorAll('.detail-btn');
        buttons.forEach(btn => {
            if (btn.textContent.includes('Copy')) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Copied!';
                btn.style.backgroundColor = '#4CAF50';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 2000);
            }
        });
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Open Polymarket with correct URL
function openPolymarket(marketId) {
    if (marketId) {
        // Use the slug to construct Polymarket URL
        const url = `https://polymarket.com/event/${marketId}`;

        // Open in external browser using Electron API
        if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    }
}

// Show error state
function showError() {
    const loadingEl = document.getElementById('loading');
    const emptyEl = document.getElementById('empty-state');
    const listEl = document.getElementById('transactions-list');

    loadingEl.style.display = 'none';
    listEl.style.display = 'none';

    emptyEl.style.display = 'block';
    emptyEl.innerHTML = `
        <p class="empty-icon">⚠️</p>
        <p class="empty-text">Failed to load transactions</p>
        <p class="empty-subtext">Make sure the backend server is running</p>
    `;
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeIcon();
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const theme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    const isLight = document.body.classList.contains('light-theme');
    themeIcon.textContent = isLight ? '☀️' : '🌙';
}

