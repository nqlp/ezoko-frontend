import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Activity } from "@prisma/client";

// ============================================================================
// API Handlers
// ============================================================================

/**
 * POST /api/stock-movements
 * Creates a new stock movement log entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      activity,
      barcode,
      variantTitle,
      srcLocation,
      srcQty,
      destinationLocation,
      destinationQty,
      referenceDoc,
      user,
    } = body;

    // Validate activity
    if (!activity || !Object.values(Activity).includes(activity)) {
      return NextResponse.json(
        { success: false, message: `Invalid activity. Must be one of: ${Object.values(Activity).join(", ")}` },
        { status: 400 }
      );
    }

    const log = await prisma.stockMovementLog.create({
      data: {
        activity: activity as Activity,
        barcode: barcode ?? null,
        variantTitle: variantTitle ?? null,
        srcLocation: srcLocation ?? null,
        srcQty: typeof srcQty === "number" ? srcQty : null,
        destinationLocation: destinationLocation ?? null,
        destinationQty: typeof destinationQty === "number" ? destinationQty : null,
        referenceDoc: referenceDoc ?? null,
        user: user ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: log.id, createdAt: log.createdAt },
    });
  } catch (error) {
    console.error("Error logging stock movement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log stock movement" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stock-movements
 * Returns the latest 100 stock movement logs
 */
export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.stockMovementLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Format dates to EST timezone for display
    const logToEST = logs.map(log => ({
      ...log,
      createdAt: log.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" }),
    }));

    return NextResponse.json({ success: true, data: logToEST });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
