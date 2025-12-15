"use client";

import { StoredTransaction } from "@/lib/database";

interface TransactionTableProps {
    transactions: StoredTransaction[];
    isLoading: boolean;
}

/**
 * Format Unix timestamp to readable date
 */
function formatTimestamp(timestamp: number): string {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

/**
 * Format amount with currency symbol and commas
 */
function formatAmount(amount: number): string {
    return `$${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Open Polymarket page for the market
 */
function openMarket(marketId: string): void {
    if (marketId) {
        const url = `https://polymarket.com/event/${marketId}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }
}

export default function TransactionTable({
    transactions,
    isLoading,
}: TransactionTableProps) {
    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading whale transactions...</span>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                <div className="emoji">🐋</div>
                <h2>No whale transactions yet</h2>
                <p>Whale transactions will appear here when detected</p>
            </div>
        );
    }

    return (
        <>
            <div className="table-container">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Market</th>
                            <th>Amount</th>
                            <th>Side</th>
                            <th>Outcome</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr
                                key={tx.tx_hash}
                                onClick={() => openMarket(tx.market_id || "")}
                                title="Click to view on Polymarket"
                            >
                                <td>{formatTimestamp(tx.timestamp)}</td>
                                <td className="market-name">{tx.market_name || "Unknown"}</td>
                                <td className="amount">{formatAmount(tx.amount)}</td>
                                <td
                                    className={
                                        tx.side === "BUY"
                                            ? "side-buy"
                                            : tx.side === "SELL"
                                                ? "side-sell"
                                                : ""
                                    }
                                >
                                    {tx.side || "N/A"}
                                </td>
                                <td>{tx.outcome || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="info-tip">💡 Click a row to view the market on Polymarket</p>
        </>
    );
}
