export type InventorySetQuantitiesPayload = {
    inventorySetQuantities: {
        inventoryAdjustmentGroup: {
            createdAt: string;
        } | null;
        userErrors: Array<{
            field: string[] | null;
            message: string;
        }>;
    };
};