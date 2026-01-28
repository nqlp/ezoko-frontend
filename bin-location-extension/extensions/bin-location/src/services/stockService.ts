import { StockItem, BinLocation } from '../types/warehouseStock';
import {
    METAOBJECT_UPDATE_MUTATION,
    UpdateStockResponse,
    INVENTORY_SET_QUANTITIES_MUTATION,
    InventorySetResponse,
    METAOBJECT_CREATE_BIN_QTY_MUTATION,
    METAFIELDS_SET_MUTATION,
    CreateBinQtyResponse,
    MetafieldsSetResponse,
    METAOBJECT_CREATE_BIN_LOCATION_MUTATION,
    CreateBinLocationResponse,
} from '../updateStock';
import {
    validateResponse,
    getUserErrorsMessage,
    toHandle,
    ShopifyQueryFct,
} from '../utils/helpers';

export interface SaveStockParams {
    items: StockItem[];
    initialQtyById: Record<string, number>;
    isAdding: boolean;
    draftQty: string;
    draftQuery: string;
    selectedBin: BinLocation | null;
    variantId: string;
    variantBarcode: string | null;
    inventoryItemId: string | null;
    locationId: string | null;
    findBinLocationByHandle: (handle: string) => Promise<BinLocation | null>;
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
        variantId,
        variantBarcode,
        inventoryItemId,
        locationId,
        findBinLocationByHandle,
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
        let binToUse = selectedBin;

        if (!binToUse) {
            if (!trimmedQuery) {
                throw new Error("Please enter a bin location name.");
            }
            const handle = toHandle(trimmedQuery);
            if (!handle) {
                throw new Error("Please enter a valid bin location name.");
            }

            const existing = await findBinLocationByHandle(handle);
            if (existing) {
                binToUse = existing;
            } else {
                binToUse = await createBinLocation(query, handle, trimmedQuery, findBinLocationByHandle);
            }
        }

        const existingIndex = nextItems.findIndex(i => i.binLocationId === binToUse!.id);
        if (existingIndex >= 0) {
            // Update existing bin qty
            await updateExistingBinQty(query, nextItems, existingIndex, qtyNum);
        } else {
            // Create new bin qty
            await createNewBinQty(query, nextItems, binToUse!, qtyNum, variantId, variantBarcode);
        }
    }

    // Sync inventory to Shopify
    if (inventoryItemId && locationId) {
        await syncInventory(query, nextItems, inventoryItemId, locationId);
    }

    return { updatedItems: nextItems };
}

async function createBinLocation(
    query: ShopifyQueryFct,
    handle: string,
    title: string,
    findBinLocationByHandle: (handle: string) => Promise<BinLocation | null>
): Promise<BinLocation> {
    const createLocationResult = await query<CreateBinLocationResponse>(METAOBJECT_CREATE_BIN_LOCATION_MUTATION, {
        variables: {
            type: "bin_location",
            handle,
            title,
        },
    });
    // Note: Don't use validateResponse here because we handle userErrors specially for "Handle is invalid"

    const createErrors = createLocationResult?.data?.metaobjectCreate?.userErrors;
    const createErrorMessage = getUserErrorsMessage(createErrors);

    if (createErrorMessage) {
        if (createErrorMessage.includes("Handle is invalid")) {
            const fallback = await findBinLocationByHandle(handle);
            if (fallback) {
                return fallback;
            }
        }
        throw new Error(createErrorMessage);
    }

    const createdId = createLocationResult?.data?.metaobjectCreate?.metaobject?.id;
    const createdHandle = createLocationResult?.data?.metaobjectCreate?.metaobject?.handle ?? handle;
    if (!createdId) {
        throw new Error("Failed to create bin location.");
    }
    return { id: createdId, handle: createdHandle, title };
}

async function updateExistingBinQty(
    query: ShopifyQueryFct,
    items: StockItem[],
    existingIndex: number,
    qtyNum: number
): Promise<void> {
    const existing = items[existingIndex];
    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
        variables: {
            id: existing.id,
            fields: [{ key: "qty", value: String(qtyNum) }],
        },
    });
    validateResponse<UpdateStockResponse>(result, d => d?.metaobjectUpdate?.userErrors);
    items[existingIndex] = { ...existing, qty: qtyNum };
}

async function createNewBinQty(
    query: ShopifyQueryFct,
    items: StockItem[],
    binToUse: BinLocation,
    qtyNum: number,
    variantId: string,
    variantBarcode: string | null
): Promise<void> {
    const handleLabel = `${binToUse.title ?? binToUse.handle} - ${variantBarcode ?? "no-barcode"}`;
    const handle = toHandle(handleLabel);
    if (!handle) {
        throw new Error("Please enter a valid bin location name.");
    }

    const result = await query<CreateBinQtyResponse>(METAOBJECT_CREATE_BIN_QTY_MUTATION, {
        variables: {
            type: "bin_qty",
            handle,
            binLocationId: binToUse.id,
            qty: String(qtyNum),
            variantId: variantId,
        },
    });
    validateResponse<CreateBinQtyResponse>(result, d => d?.metaobjectCreate?.userErrors);

    const newId = result?.data?.metaobjectCreate?.metaobject?.id;
    if (!newId) throw new Error("Failed to create bin quantity metaobject.");

    // Add to variant metafield
    const newBinQtyItem = JSON.stringify([...items.map(item => item.id), newId]);

    const setResponse = await query<MetafieldsSetResponse>(METAFIELDS_SET_MUTATION, {
        variables: {
            metafields: [
                {
                    ownerId: variantId,
                    namespace: "custom",
                    key: "warehouse_stock",
                    type: "list.metaobject_reference",
                    value: newBinQtyItem,
                },
            ],
        },
    });
    validateResponse<MetafieldsSetResponse>(setResponse, d => d?.metafieldsSet?.userErrors);

    items.push({
        id: newId,
        bin: binToUse.title || binToUse.handle,
        qty: qtyNum,
        binLocationId: binToUse.id,
    });
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
