/**
 * Polymarket API client for fetching whale transactions.
 * TypeScript port of polymarket_api.py
 */

import {
  TRADES_ENDPOINT,
  FILTER_TYPE,
  DEFAULT_WHALE_THRESHOLD,
  API_TIMEOUT,
  MAX_RETRIES,
  TRADES_LIMIT,
  INITIAL_FETCH_HOURS,
  FALLBACK_FETCH_DAYS,
} from "./config";

export interface TradeDetails {
  price?: number;
  size?: number;
  fee_rate?: number;
  transaction_hash?: string;
  bucket_index?: number;
  match_time?: number;
  slug?: string;
  event_slug?: string;
  raw_data?: Record<string, unknown>;
}

export interface WhaleTrade {
  tx_hash: string;
  amount: number;
  market_name: string;
  market_id: string;
  outcome: string;
  side: string;
  trader_address: string;
  timestamp: number;
  details: TradeDetails;
}

interface RawTrade {
  transactionHash?: string;
  id?: string;
  price?: number;
  size?: number;
  title?: string;
  eventSlug?: string;
  slug?: string;
  outcome?: string;
  side?: string;
  proxyWallet?: string;
  takerAddress?: string;
  makerAddress?: string;
  timestamp?: number;
  matchTime?: number;
  feeRateBps?: number;
  bucketIndex?: number;
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch trades from Polymarket API
 */
export async function fetchTrades(
  whaleThreshold: number = DEFAULT_WHALE_THRESHOLD,
  startTime?: number,
  endTime?: number,
  limit: number = TRADES_LIMIT
): Promise<WhaleTrade[]> {
  const params = new URLSearchParams({
    filterType: FILTER_TYPE,
    filterAmount: whaleThreshold.toString(),
    limit: limit.toString(),
    sortBy: "TIMESTAMP",
    sortDirection: "DESC",
  });

  if (startTime) {
    params.set("start", startTime.toString());
  }
  if (endTime) {
    params.set("end", endTime.toString());
  }

  const url = `${TRADES_ENDPOINT}?${params.toString()}`;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: RawTrade[] = await response.json();
      return parseTrades(data);
    } catch (error) {
      console.error(
        `API request failed (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        error
      );
      if (attempt < MAX_RETRIES - 1) {
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
      } else {
        throw error;
      }
    }
  }

  return [];
}

/**
 * Parse and normalize trade data from API response
 */
function parseTrades(data: RawTrade[]): WhaleTrade[] {
  const trades: WhaleTrade[] = [];

  for (const trade of data) {
    try {
      const txHash = trade.transactionHash || trade.id || "";
      const price = Number(trade.price) || 0;
      const size = Number(trade.size) || 0;
      const amount = price * size;

      if (!txHash || amount <= 0) {
        continue;
      }

      const normalizedTrade: WhaleTrade = {
        tx_hash: txHash,
        amount: amount,
        market_name: trade.title || "Unknown Market",
        market_id: trade.eventSlug || trade.slug || "",
        outcome: trade.outcome || "",
        side: trade.side || "UNKNOWN",
        trader_address:
          trade.proxyWallet || trade.takerAddress || trade.makerAddress || "",
        timestamp: Number(trade.timestamp) || Number(trade.matchTime) || 0,
        details: {
          price: trade.price,
          size: trade.size,
          fee_rate: trade.feeRateBps,
          transaction_hash: trade.transactionHash,
          bucket_index: trade.bucketIndex,
          match_time: trade.matchTime,
          slug: trade.slug,
          event_slug: trade.eventSlug,
          raw_data: trade as unknown as Record<string, unknown>,
        },
      };

      trades.push(normalizedTrade);
    } catch (error) {
      console.error("Error parsing trade:", error);
      continue;
    }
  }

  return trades;
}

/**
 * Fetch initial trades on first run
 */
export async function fetchInitialTrades(
  whaleThreshold: number = DEFAULT_WHALE_THRESHOLD
): Promise<WhaleTrade[]> {
  const now = Math.floor(Date.now() / 1000);

  // Try last 24 hours first
  const start24h = now - INITIAL_FETCH_HOURS * 3600;
  console.log(`Fetching trades from last ${INITIAL_FETCH_HOURS} hours...`);
  let trades = await fetchTrades(whaleThreshold, start24h, now);

  if (trades.length > 0) {
    console.log(`Found ${trades.length} whale trades in last 24 hours`);
    return trades;
  }

  // Fallback to 7 days
  console.log("No trades found in last 24 hours, trying last 7 days...");
  const start7d = now - FALLBACK_FETCH_DAYS * 24 * 3600;
  trades = await fetchTrades(whaleThreshold, start7d, now);

  if (trades.length > 0) {
    console.log(`Found ${trades.length} whale trades in last 7 days`);
  } else {
    console.log("No whale trades found in last 7 days");
  }

  return trades;
}

/**
 * Fetch trades since the last fetch time
 */
export async function fetchNewTrades(
  lastFetchTime: number,
  whaleThreshold: number = DEFAULT_WHALE_THRESHOLD
): Promise<WhaleTrade[]> {
  const now = Math.floor(Date.now() / 1000);
  console.log(
    `Fetching new trades since ${new Date(lastFetchTime * 1000).toISOString()}`
  );
  const trades = await fetchTrades(whaleThreshold, lastFetchTime, now);
  console.log(`Found ${trades.length} new whale trades`);
  return trades;
}
