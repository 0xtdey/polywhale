"use client";

import { useState, useEffect, useCallback } from "react";
import TransactionTable from "@/components/TransactionTable";
import NotificationBanner from "@/components/NotificationBanner";
import DownloadSection from "@/components/DownloadSection";
import { StoredTransaction } from "@/lib/database";
import { POLL_INTERVAL_SECONDS } from "@/lib/config";

interface Status {
    is_running: boolean;
    last_fetch: number | null;
    total_trades: number;
    poll_interval: number;
    whale_threshold: number;
}

export default function WebApp() {
    const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [threshold, setThreshold] = useState<number>(10000);
    const [thresholdInput, setThresholdInput] = useState<string>("10000");
    const [status, setStatus] = useState<Status | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Fetch transactions from API
    const fetchTransactions = useCallback(async (showLoading: boolean = false) => {
        if (showLoading) setIsLoading(true);

        try {
            const response = await fetch("/api/transactions?limit=100");
            const data = await response.json();

            if (data.success) {
                const prevCount = transactions.length;
                setTransactions(data.transactions);
                setLastUpdate(new Date());

                // Show notification for new trades (only if we have existing data and notifications enabled)
                if (prevCount > 0 && data.transactions.length > prevCount && notificationsEnabled) {
                    const newCount = data.transactions.length - prevCount;
                    showNotification(newCount, data.transactions[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [transactions.length, notificationsEnabled]);

    // Fetch status
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch("/api/status");
            const data = await response.json();

            if (data.success) {
                setStatus(data.status);
                setThreshold(data.status.whale_threshold);
                setThresholdInput(data.status.whale_threshold.toString());
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    }, []);

    // Manual refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            const response = await fetch("/api/refresh", { method: "POST" });
            const data = await response.json();

            if (data.success) {
                // Refetch transactions after refresh
                await fetchTransactions(false);

                if (data.newTrades > 0 && notificationsEnabled) {
                    showNotification(data.newTrades, transactions[0]);
                }
            }
        } catch (error) {
            console.error("Error refreshing:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Update threshold
    const handleThresholdUpdate = async () => {
        const newThreshold = parseFloat(thresholdInput);

        if (isNaN(newThreshold) || newThreshold <= 0) {
            alert("Please enter a valid positive number");
            return;
        }

        try {
            const response = await fetch("/api/threshold", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: newThreshold }),
            });

            const data = await response.json();

            if (data.success) {
                setThreshold(newThreshold);
                // Trigger refresh to get new data with updated threshold
                handleRefresh();
            }
        } catch (error) {
            console.error("Error updating threshold:", error);
        }
    };

    // Show browser notification
    const showNotification = (count: number, latestTrade: StoredTransaction) => {
        if (Notification.permission === "granted" && latestTrade) {
            const amount = latestTrade.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });

            new Notification(`🐋 ${count} New Whale Trade${count > 1 ? "s" : ""}!`, {
                body: `${latestTrade.market_name}\n${amount} ${latestTrade.side}`,
                icon: "/icon.png",
                tag: "whale-trade",
            });
        }
    };

    // Initial load
    useEffect(() => {
        fetchTransactions(true);
        fetchStatus();

        // Check notification permission
        if ("Notification" in window && Notification.permission === "granted") {
            setNotificationsEnabled(true);
        }
    }, []);

    // Polling for new transactions
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTransactions(false);
        }, POLL_INTERVAL_SECONDS * 1000);

        return () => clearInterval(interval);
    }, [fetchTransactions]);

    // Format last update time
    const formatLastUpdate = () => {
        if (!lastUpdate) return "Never";
        return lastUpdate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <main className="container">
            <NotificationBanner
                onSubscribe={() => setNotificationsEnabled(true)}
            />

            <header className="header">
                <h1>🐋 Polymarket Whale Transactions</h1>

                <div className="header-controls">
                    <div className="threshold-control">
                        <label htmlFor="threshold">Whale Threshold ($):</label>
                        <input
                            type="number"
                            id="threshold"
                            value={thresholdInput}
                            onChange={(e) => setThresholdInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleThresholdUpdate()}
                            min="1"
                        />
                        <button className="btn btn-primary" onClick={handleThresholdUpdate}>
                            Update
                        </button>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
                    </button>
                </div>
            </header>

            <TransactionTable transactions={transactions} isLoading={isLoading} />

            <div className="status-bar">
                <div className="info">
                    <span>Total: {transactions.length} whale transactions</span>
                    {status?.last_fetch && (
                        <span>
                            Last API fetch:{" "}
                            {new Date(status.last_fetch * 1000).toLocaleString("en-GB")}
                        </span>
                    )}
                </div>
                <span>Last updated: {formatLastUpdate()}</span>
            </div>

            <DownloadSection />
        </main>
    );
}
