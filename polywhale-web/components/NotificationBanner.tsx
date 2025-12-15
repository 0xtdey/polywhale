"use client";

import { useState, useCallback } from "react";

interface NotificationBannerProps {
    onSubscribe?: () => void;
}

export default function NotificationBanner({
    onSubscribe,
}: NotificationBannerProps) {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "default"
    );
    const [isSubscribing, setIsSubscribing] = useState(false);

    const requestPermission = useCallback(async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support push notifications");
            return;
        }

        setIsSubscribing(true);

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                // Register service worker
                if ("serviceWorker" in navigator) {
                    const registration = await navigator.serviceWorker.register("/sw.js");
                    console.log("Service Worker registered:", registration);
                }

                onSubscribe?.();
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        } finally {
            setIsSubscribing(false);
        }
    }, [onSubscribe]);

    // Don't show banner if notifications are already granted or denied
    if (permission === "granted") {
        return null;
    }

    if (permission === "denied") {
        return (
            <div
                className="notification-banner"
                style={{ background: "var(--bg-tertiary)" }}
            >
                <p>
                    🔕 Notifications are blocked. Enable them in your browser settings to
                    receive whale alerts.
                </p>
            </div>
        );
    }

    return (
        <div className="notification-banner">
            <p>🔔 Enable push notifications to get instant alerts for new whale trades!</p>
            <button
                className="btn"
                onClick={requestPermission}
                disabled={isSubscribing}
            >
                {isSubscribing ? "⏳ Enabling..." : "Enable Notifications"}
            </button>
        </div>
    );
}
