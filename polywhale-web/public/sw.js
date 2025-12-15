/**
 * Service Worker for PolyWhale Web
 * Handles push notifications for whale trades
 */

// Install event - cache assets
self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...");
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...");
    event.waitUntil(self.clients.claim());
});

// Push event - show notification
self.addEventListener("push", (event) => {
    console.log("Service Worker: Push received");

    let data = {
        title: "🐋 New Whale Trade!",
        body: "A whale trade has been detected",
        icon: "/icon.png",
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || "/icon.png",
        badge: "/icon.png",
        vibrate: [200, 100, 200],
        tag: "whale-trade",
        renotify: true,
        actions: [
            { action: "view", title: "View Trades" },
            { action: "dismiss", title: "Dismiss" }
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event - open app
self.addEventListener("notificationclick", (event) => {
    console.log("Service Worker: Notification clicked");

    event.notification.close();

    if (event.action === "dismiss") {
        return;
    }

    // Open or focus the app
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Try to focus existing window
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && "focus" in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow("/");
                }
            })
    );
});

// Fetch event - network first strategy
self.addEventListener("fetch", (event) => {
    // Skip for API requests
    if (event.request.url.includes("/api/")) {
        return;
    }
});
