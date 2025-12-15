/**
 * Configuration settings for PolyWhale Web
 */

// Polymarket API settings
export const POLYMARKET_API_BASE = "https://data-api.polymarket.com";
export const TRADES_ENDPOINT = `${POLYMARKET_API_BASE}/trades`;

// Whale transaction threshold (in USD)
export const DEFAULT_WHALE_THRESHOLD = 10000;

// Polling settings
export const POLL_INTERVAL_SECONDS = 30; // Client-side polling interval
export const INITIAL_FETCH_HOURS = 24;
export const FALLBACK_FETCH_DAYS = 7;

// API request settings
export const API_TIMEOUT = 30000; // 30 seconds in ms
export const MAX_RETRIES = 3;
export const TRADES_LIMIT = 500;

// Filter settings
export const FILTER_TYPE = "CASH";
