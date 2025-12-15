/**
 * API Route: GET /api/status
 * Get service status
 */

import { NextResponse } from "next/server";
import {
  getLastFetchTime,
  getTransactionCount,
  getWhaleThreshold,
} from "@/lib/database";
import { POLL_INTERVAL_SECONDS } from "@/lib/config";

export async function GET() {
  try {
    const status = {
      is_running: true,
      last_fetch: getLastFetchTime(),
      total_trades: getTransactionCount(),
      poll_interval: POLL_INTERVAL_SECONDS,
      whale_threshold: getWhaleThreshold(),
    };

    return NextResponse.json({
      success: true,
      status: status,
    });
  } catch (error) {
    console.error("ERROR in /api/status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
