"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Static mock data for preview (uses fixed timestamps to avoid hydration mismatch)
interface MockTransaction {
    tx_hash: string;
    timestamp: number;
    market_name: string;
    amount: number;
    side: "BUY" | "SELL";
    outcome: string;
}

// Using fixed timestamps (will be formatted as relative times on client)
const BASE_TIMESTAMP = 1734400000; // Fixed base timestamp

const MOCK_TRANSACTIONS: MockTransaction[] = [
    { tx_hash: "0x1a2b3c", timestamp: BASE_TIMESTAMP - 120, market_name: "Will Bitcoin exceed $100k by Dec 2024?", amount: 125000, side: "BUY", outcome: "Yes" },
    { tx_hash: "0x2b3c4d", timestamp: BASE_TIMESTAMP - 300, market_name: "Trump wins 2024 election", amount: 89500, side: "SELL", outcome: "No" },
    { tx_hash: "0x3c4d5e", timestamp: BASE_TIMESTAMP - 540, market_name: "Fed cuts rates in January 2025", amount: 67800, side: "BUY", outcome: "Yes" },
    { tx_hash: "0x4d5e6f", timestamp: BASE_TIMESTAMP - 900, market_name: "ETH flips BTC market cap 2025", amount: 45200, side: "BUY", outcome: "Yes" },
    { tx_hash: "0x5e6f7g", timestamp: BASE_TIMESTAMP - 1200, market_name: "SpaceX Starship successful landing", amount: 32100, side: "SELL", outcome: "No" },
    { tx_hash: "0x6f7g8h", timestamp: BASE_TIMESTAMP - 1800, market_name: "Apple releases AR glasses 2025", amount: 28900, side: "BUY", outcome: "Yes" },
];

export default function LandingPage() {
    const GITHUB_REPO = "https://github.com/0xtdey/polywhale";
    const GITHUB_RELEASES = "https://github.com/0xtdey/polywhale/releases/latest";
    const WEB_APP_URL = "/webapp";

    // State for preview animation
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [transactions] = useState<MockTransaction[]>(MOCK_TRANSACTIONS);
    const isLoading = false;

    // Format timestamp
    const formatTime = (timestamp: number): string => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    // Format amount
    const formatAmount = (amount: number): string => {
        return `$${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Simulated refresh animation for the preview
    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Just a visual effect - no actual API call
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-container">
                    <Link href="/" className="navbar-logo">
                        <Image
                            src="/icon.png"
                            alt="PolyWhale Logo"
                            width={32}
                            height={32}
                            className="logo-image"
                        />
                        <span className="logo-text">
                            polyWhale
                        </span>
                    </Link>

                    <div className="navbar-links">
                        <Link href="#features" className="nav-link">
                            Features
                        </Link>
                        <Link href="#download" className="nav-link">
                            Desktop App
                        </Link>
                        <Link href={WEB_APP_URL} className="navbar-cta">
                            Launch App
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="features">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Watch the whales move
                        <br />
                        <span className="hero-highlight">before the crowd.</span>
                    </h1>

                    <p className="hero-subtitle">
                        The one stop for tracking Polymarket whales. Available
                        directly in your browser or as a high-performance desktop client.
                    </p>

                    <div className="hero-ctas">
                        <Link href={WEB_APP_URL} className="btn-hero-primary">
                            Open Web App
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href="#download" className="btn-hero-secondary">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Get Desktop App
                        </Link>
                    </div>
                </div>

                {/* Preview Window */}
                <div className="hero-preview">
                    <div className="preview-window">
                        <div className="preview-header">
                            <div className="preview-dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                        </div>
                        <div className="preview-content">
                            <div className="preview-dashboard">
                                <div className="preview-header-bar">
                                    <div className="preview-title-group">
                                        <h3>🐋 Polymarket Whale Transactions</h3>
                                    </div>
                                    <button
                                        className="preview-refresh-btn"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                    >
                                        {isRefreshing ? "⏳" : "🔄"} Refresh
                                    </button>
                                </div>
                                <div className="preview-table">
                                    <div className="table-header">
                                        <span>Timestamp</span>
                                        <span>Market</span>
                                        <span>Amount</span>
                                        <span>Side</span>
                                        <span>Outcome</span>
                                    </div>
                                    {isLoading ? (
                                        <div className="table-row" style={{ justifyContent: "center", padding: "40px 16px" }}>
                                            <span style={{ color: "#94a3b8" }}>Loading whale transactions...</span>
                                        </div>
                                    ) : transactions.length === 0 ? (
                                        <div className="table-row" style={{ justifyContent: "center", padding: "40px 16px" }}>
                                            <span style={{ color: "#94a3b8" }}>No whale transactions yet</span>
                                        </div>
                                    ) : (
                                        transactions.slice(0, 6).map((tx) => (
                                            <div className="table-row" key={tx.tx_hash}>
                                                <span className="time">{formatTime(tx.timestamp)}</span>
                                                <span className="market">{tx.market_name || "Unknown"}</span>
                                                <span className="amount">{formatAmount(tx.amount)}</span>
                                                <div className={`side-box ${tx.side === "BUY" ? "buy" : "sell"}`}>
                                                    {tx.side || "N/A"}
                                                </div>
                                                <span className="outcome">{tx.outcome || "N/A"}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section className="download-section" id="download">
                <div className="download-wrapper">
                    <div className="download-left">
                        <h2 className="download-title">
                            Power User?
                            <br />
                            Get the Desktop Client.
                        </h2>
                        <p className="download-subtitle">
                            For institutional traders and developers who need raw
                            performance, local logging, and multi-monitor support.
                        </p>

                        <div className="download-features">
                            <div className="feature-item">
                                <div className="feature-icon">⚡</div>
                                <div className="feature-content">
                                    <h4>Low Latency Mode</h4>
                                    <p>Direct node connection bypassing browser limitations.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔔</div>
                                <div className="feature-content">
                                    <h4>System-wide Alerts</h4>
                                    <p>Custom sound and desktop notifications for whale movements.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="download-right">
                        <div className="download-card">
                            <div className="card-icon windows-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                </svg>
                            </div>
                            <div className="card-info">
                                <h3>Windows</h3>
                                <p>Setup .exe (x64) • v1.0.2</p>
                            </div>
                            <Link
                                href={GITHUB_RELEASES}
                                className="download-btn windows-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            </Link>
                        </div>

                        <div className="download-card">
                            <div className="card-icon linux-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151.467-.182.825-1.065 1.224-.915.4-1.646.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049c.254.015.504.06.756.18.252.058.39.263.39.671 0 .463-.14.601-.476.801a4.8 4.8 0 01-.768.27c-.316.116-.669.272-1.181.399-.064-.265-.162-.528-.222-.794-.063-.2-.087-.401-.038-.535.024-.2.127-.4.28-.534.152-.133.357-.266.61-.4.252-.131.559-.198.907-.198l.116-.003c.037 0 .073 0 .11.003z" />
                                </svg>
                            </div>
                            <div className="card-info">
                                <h3>Linux / Ubuntu</h3>
                                <p>deb / AppImage • v1.0.2</p>
                            </div>
                            <Link
                                href={GITHUB_RELEASES}
                                className="download-btn linux-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* GitHub Section */}
                <div className="github-section">
                    <p>Are you a developer?</p>
                    <Link
                        href={GITHUB_REPO}
                        className="github-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        View Source Code on GitHub
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <Link href="/" className="footer-logo">
                        <Image
                            src="/icon.png"
                            alt="PolyWhale Logo"
                            width={24}
                            height={24}
                            className="logo-image"
                        />
                        <span className="logo-text">polyWhale</span>
                    </Link>
                    <p className="footer-copyright">
                        © 2024 polyWhale Project. Open Source Software.
                    </p>
                </div>
            </footer>
        </div>
    );
}
