/**
 * API Route: GET /api/transactions
 * Fetch whale transactions from database
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllTransactions,
  insertTransaction,
  getLastFetchTime,
  setLastFetchTime,
  getWhaleThreshold,
} from "@/lib/database";
import { fetchInitialTrades, fetchNewTrades } from "@/lib/polymarket-api";

export async function GET(request: NextRequest) {
  try {
    // Get limit from query parameter
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get("limit") || "100", 10))
    );

    // Check if we need to fetch from API (initial load or refresh)
    const lastFetchTime = getLastFetchTime();

    if (!lastFetchTime) {
      // First run - fetch initial trades
      console.log("First run detected - fetching initial trades...");
      const threshold = getWhaleThreshold();
      const trades = await fetchInitialTrades(threshold);

      let newCount = 0;
      for (const trade of trades) {
        if (insertTransaction(trade)) {
          newCount++;
        }
      }

      console.log(`Initial fetch complete: ${newCount} whale trades stored`);
      setLastFetchTime(Math.floor(Date.now() / 1000));
    }

    const transactions = getAllTransactions(limit);

    return NextResponse.json({
      success: true,
      transactions: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("ERROR in /api/transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
