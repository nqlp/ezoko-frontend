type CorrectionLogInput = {
  user?: string | null;
  barcode?: string | null;
  variantId?: string | null;
  destinationLocation?: string | null;
  destinationQty?: number | null;
  referenceDoc?: string | null;
  token?: string | null;
};

enum Activity {
  CORRECTION = "Correction",
  GOODS_RECEIPT = "Goods Receipt",
  MOVEMENT = "Movement",
  PICKING = "Picking",
  GOODS_ISSUE = "Goods Issue",
  INV_COUNTING = "Inv Counting",
}

type CorrectionStockMovementPayload = {
  activity: Activity.CORRECTION;
  barcode?: string | null;
  variantId?: string | null;
  srcLocation?: string | null;
  srcQty?: number | null;
  destinationLocation?: string | null;
  destinationQty?: number | null;
  referenceDoc?: string | null;
  user?: string | null;
};

/**
 * Returns the stock movement API endpoint URL.
 * IMPORTANT: Must be HTTPS for Shopify Admin UI Extensions.
 * Note: Hardcoded because browser extensions don't have access to process.env
 */
function getEndpoint(): string {
  return "https://ezoko-frontend-test.up.railway.app/api/stock-movements";
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extracts user ID from a JWT token
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    console.warn("Failed to parse JWT token for user ID");
    return null;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Logs a stock correction movement to the database.
 * Called when quantities are updated via the Admin UI extension.
 * 
 * @param input - The correction details to log
 */
export async function logCorrectionMovement(input: CorrectionLogInput): Promise<void> {
  const endpoint = getEndpoint();

  // Resolve user ID from input or token
  const userId = input.user ?? (input.token ? extractUserIdFromToken(input.token) : null);

  const payload: CorrectionStockMovementPayload = {
    activity: Activity.CORRECTION,
    barcode: input.barcode ?? null,
    variantId: input.variantId ?? null,
    srcLocation: null, // Corrections don't have a source
    srcQty: null,
    destinationLocation: input.destinationLocation ?? null,
    destinationQty: input.destinationQty ?? null,
    referenceDoc: input.referenceDoc ?? null, // No ref doc for Admin UI corrections
    user: userId,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (input.token) {
    headers.Authorization = `Bearer ${input.token}`;
  }

  console.log("Logging stock movement:", { endpoint, activity: payload.activity });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Stock movement log failed: ${response.status}`, text);
    } else {
      console.log("Stock movement logged successfully");
    }
  } catch (error) {
    console.error("Stock movement logging failed:", error);
  }
}
