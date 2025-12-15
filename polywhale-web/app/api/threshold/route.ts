/**
 * API Route: GET/POST /api/threshold
 * Get or update whale threshold
 */

import { NextRequest, NextResponse } from "next/server";
import { getWhaleThreshold, setWhaleThreshold } from "@/lib/database";

export async function GET() {
  try {
    const threshold = getWhaleThreshold();
    return NextResponse.json({
      success: true,
      threshold: threshold,
    });
  } catch (error) {
    console.error("ERROR in /api/threshold GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const amount = data.amount;

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount is required",
        },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount: must be a positive number",
        },
        { status: 400 }
      );
    }

    setWhaleThreshold(parsedAmount);

    return NextResponse.json({
      success: true,
      threshold: parsedAmount,
      message: "Threshold updated successfully",
    });
  } catch (error) {
    console.error("ERROR in /api/threshold POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
