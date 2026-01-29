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
} from '../updateStock';
import {
    validateResponse,
    ShopifyQueryFct,
} from '../utils/helpers';

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
}

export interface SaveStockResult {
    updatedItems: StockItem[];
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
        findBinLocationBySearch,
        query,
    } = params;

    // Update dirty items (changed quantities)
    const dirtyItems = items.filter(
        (item) => item.qty !== (initialQtyById[item.id] ?? item.qty)
    );

    for (const item of dirtyItems) {
        const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
            variables: {
                id: item.id,
                fields: [{ key: "qty", value: String(item.qty) }],
            },
        });
        validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
    }

    const nextItems = [...items];

    // Handle adding new bin location
    if (isAdding) {
        const qtyNum = parseInt(draftQty, 10);
        if (!Number.isFinite(qtyNum) || qtyNum < 0) {
            throw new Error("Please enter a valid quantity.");
        }

        const trimmedQuery = draftQuery.trim();
        let targetBinLocation = selectedBin;

        if (!selectedBin) {
            throw new Error("Please select a bin location.");
        }

        if (!targetBinLocation) {
            if (!trimmedQuery) {
                throw new Error("Please enter a bin location name.");
            }

            const existing = await findBinLocationBySearch(trimmedQuery);
            if (existing) {
                targetBinLocation = existing;
            } else {
                throw new Error(`Bin Location "${trimmedQuery}" does not exist.`);
            }
        }

        const exitingStockIndex = nextItems.findIndex(i => i.binLocationId === targetBinLocation!.id);
        if (exitingStockIndex >= 0) {
            // Update existing bin qty
            await updateExistingBinQty(query, nextItems, exitingStockIndex, qtyNum);
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
    exitingStockIndex: number,
    qtyNum: number,
): Promise<void> {
    const existing = items[exitingStockIndex];
    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
        variables: {
            id: existing.id,
            fields: [{ key: "qty", value: String(qtyNum) }],
        },
    });
    validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
    items[exitingStockIndex] = { ...existing, qty: qtyNum };
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