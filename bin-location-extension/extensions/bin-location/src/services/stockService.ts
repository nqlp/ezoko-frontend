/* - Detect changes in qty and update the metaobject, 
   - create or update bin location (metaobject) and qty if they exist, 
   - sync inventory to Shopify,
*/

import { StockItem, BinLocation } from '../types/warehouseStock';
import {
    METAOBJECT_UPDATE_MUTATION,
    UpdateStockResponse,
    INVENTORY_SET_QUANTITIES_MUTATION,
    InventorySetResponse,
    GET_STAFF_MEMBER_QUERY,
    GetStaffMemberResponse,
} from '../updateStock';
import {
    validateResponse,
    ShopifyQueryFct,
} from '../utils/helpers';
import { logCorrectionMovement, extractUserIdFromToken } from './stockMovementLog';

export interface SaveStockParams {
    items: StockItem[];
    initialQtyById: Record<string, number>;
    isAdding: boolean;
    draftQty: string;
    draftQuery: string;
    selectedBin: BinLocation | null;
    inventoryItemId: string | null;
    locationId: string | null;
    findBinLocationBySearch: (searchString: string) => Promise<BinLocation | null>;
    query: ShopifyQueryFct;
    variantTitle?: string | null;
    variantBarcode?: string | null;
    token?: string | null;
}

export interface SaveStockResult {
    updatedItems: StockItem[];
}

async function getUserEmail(query: ShopifyQueryFct, token: string | null | undefined): Promise<string | null> {
    if (!token) return null;
    const userId = extractUserIdFromToken(token);
    if (!userId) return null;

    try {
        const staffId = `gid://shopify/StaffMember/${userId}`;
        const result = await query<GetStaffMemberResponse>(GET_STAFF_MEMBER_QUERY, {
            variables: { id: staffId },
        });
        return result?.data?.staffMember?.email ?? null;
    } catch (error) {
        console.warn("Failed to fetch staff email:", error);
        return null;
    }
}

/**
 * Save stock changes including updating existing items, creating new bin locations,
 * and syncing inventory to Shopify
 */
export async function saveStock(params: SaveStockParams): Promise<SaveStockResult> {
    const {
        items,
        initialQtyById,
        isAdding,
        draftQty,
        draftQuery,
        selectedBin,
        inventoryItemId,
        locationId,
        query,
        variantTitle,
        variantBarcode,
        token,
    } = params;

    // Fetch user email once if possible
    const userEmail = await getUserEmail(query, token);

    // Update dirty items (changed quantities)
    const dirtyItems = items.filter(
        (item) => item.qty !== (initialQtyById[item.id] ?? item.qty)
    );

    await Promise.all(dirtyItems.map(async (item) => {
        const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
            variables: {
                id: item.id,
                fields: [{ key: "qty", value: String(item.qty) }],
            },
        });
        validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
        await logCorrectionMovement({
            barcode: variantBarcode,
            variantTitle: variantTitle,
            destinationLocation: item.bin,
            destinationQty: item.qty,
            token,
            user: userEmail, // Log with email if available
        });
    }));

    const nextItems = [...items];

    // Handle adding new bin location
    if (isAdding) {
        const trimmedQuery = draftQuery.trim();

        if (!selectedBin) {
            if (!trimmedQuery) {
                throw new Error("Please type and select a bin location.");
            }
            throw new Error(`"${trimmedQuery}" is not selected. Please choose a bin location from the suggestions.`);
        }

        const qtyNum = parseInt(draftQty, 10);
        if (!Number.isFinite(qtyNum) || qtyNum < 0) {
            throw new Error("Please enter a valid quantity.");
        }

        const existingStockIndex = nextItems.findIndex((i) => i.binLocationId === selectedBin.id);
        if (existingStockIndex >= 0) {
            await updateExistingBinQty(query, nextItems, existingStockIndex, qtyNum, {
                variantTitle,
                variantBarcode,
                token,
                userEmail
            });
        } else {
            throw new Error(`This bin location: "${trimmedQuery}" is not yet linked to this variant.`);
        }
    }

    // Sync inventory to Shopify
    if (inventoryItemId && locationId) {
        await syncInventory(query, nextItems, inventoryItemId, locationId);
    }

    return { updatedItems: nextItems };
}

async function updateExistingBinQty(
    query: ShopifyQueryFct,
    items: StockItem[],
    existingStockIndex: number,
    qtyNum: number,
    logContext?: { variantTitle?: string | null; variantBarcode?: string | null; token?: string | null; userEmail?: string | null },
): Promise<void> {
    const existing = items[existingStockIndex];
    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
        variables: {
            id: existing.id,
            fields: [{ key: "qty", value: String(qtyNum) }],
        },
    });
    validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
    await logCorrectionMovement({
        barcode: logContext?.variantBarcode,
        variantTitle: logContext?.variantTitle,
        destinationLocation: existing.bin,
        destinationQty: qtyNum,
        token: logContext?.token,
        user: logContext?.userEmail
    });
    items[existingStockIndex] = { ...existing, qty: qtyNum };
}

async function syncInventory(
    query: ShopifyQueryFct,
    items: StockItem[],
    inventoryItemId: string,
    locationId: string
): Promise<void> {
    const sumOfBins = items.reduce((current, item) => current + item.qty, 0);
    const inventoryResult = await query<InventorySetResponse>(INVENTORY_SET_QUANTITIES_MUTATION, {
        variables: {
            inventoryItemId,
            locationId,
            quantity: sumOfBins
        }
    });
    validateResponse<InventorySetResponse>(inventoryResult, data => data?.inventorySetQuantities?.userErrors);
}