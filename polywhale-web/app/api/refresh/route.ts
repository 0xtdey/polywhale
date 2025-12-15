/**
 * API Route: POST /api/refresh
 * Manually trigger a refresh from Polymarket API
 */

import { NextResponse } from "next/server";
import {
  insertTransaction,
  getLastFetchTime,
  setLastFetchTime,
  getWhaleThreshold,
} from "@/lib/database";
import { fetchInitialTrades, fetchNewTrades } from "@/lib/polymarket-api";

export async function POST() {
  try {
    const lastFetchTime = getLastFetchTime();
    const threshold = getWhaleThreshold();

    let trades;
    let message;

    if (!lastFetchTime) {
      // First run
      trades = await fetchInitialTrades(threshold);
      message = "Initial trades fetched";
    } else {
      // Fetch new trades since last fetch
      trades = await fetchNewTrades(lastFetchTime, threshold);
      message = "New trades fetched";
    }

    let newCount = 0;
    for (const trade of trades) {
      if (insertTransaction(trade)) {
        newCount++;
      }
    }

    // Update last fetch time
    setLastFetchTime(Math.floor(Date.now() / 1000));

    return NextResponse.json({
      success: true,
      message: message,
      newTrades: newCount,
      totalFetched: trades.length,
    });
  } catch (error) {
    console.error("ERROR in /api/refresh:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
