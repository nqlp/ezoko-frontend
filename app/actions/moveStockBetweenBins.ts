"use server";

import { ApiResponse } from "@/lib/types/ApiResponse";
import { UpdateBinQtyByID } from "./updateBinQty";
import { logMoveMovement } from "@/lib/stockMovement";

interface MoveStockInput {
    sourceBinId: string;
    sourceBinName: string;
    sourceBinQtyBefore: number;
    destinationBinId: string;
    destinationBinName: string;
    destinationBinQtyBefore: number;
    moveQty: number;
    barcode?: string;
    variantTitle?: string;
    user?: string;
}

export async function moveStockBetweenBins(input: MoveStockInput): Promise<ApiResponse<void>> {
    const {
        sourceBinId,
        sourceBinName,
        sourceBinQtyBefore,
        destinationBinId,
        destinationBinName,
        destinationBinQtyBefore,
        moveQty,
        barcode,
        variantTitle,
        user,
    } = input;

    // Calculate quantities after move
    const sourceQtyAfter = sourceBinQtyBefore - moveQty;
    const destQtyAfter = destinationBinQtyBefore + moveQty;

    // Update source bin (decrease)
    const sourceResult = await UpdateBinQtyByID(sourceBinId, sourceQtyAfter);
    if (!sourceResult.success) {
        return {
            success: false,
            message: `Failed to update source bin: ${sourceResult.message}`
        };
    }

    // Update destination bin (increase)
    const destResult = await UpdateBinQtyByID(destinationBinId, destQtyAfter);
    if (!destResult.success) {
        // TODO: Consider rollback mechanism
        return {
            success: false,
            message: `Failed to update destination bin: ${destResult.message}`
        };
    }

    // Log to database only if both updates succeeded
    await logMoveMovement({
        barcode: input.barcode ?? null,
        variantTitle: input.variantTitle ?? null,
        srcLocation: input.sourceBinName,
        srcQty: input.sourceBinQtyBefore,
        destinationLocation: input.destinationBinName,
        destinationQty: input.destinationBinQtyBefore,
        user: input.user ?? null,
    });

    return { success: true, data: undefined };
}
