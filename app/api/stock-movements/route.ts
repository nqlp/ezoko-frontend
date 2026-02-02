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
      variantId,
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
        barcode: barcode,
        variantId: variantId ?? null,
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
 * OPTIONS /api/stock-movements
 * CORS preflight handler
 * Global CORS is handled in next.config.ts, but standard practice often includes 
 * an OPTIONS handler for API routes to ensure preflights resolve correctly.
 */
export async function OPTIONS() {
  return NextResponse.json({});
}

/**
 * GET /api/stock-movements
 * Returns the latest 100 stock movement logs
 */
export async function GET() {
  try {
    const logs = await prisma.stockMovementLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
