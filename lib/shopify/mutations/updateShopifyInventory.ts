export const SYNC_SHOPIFY_INVENTORY = /* GraphQL */`
mutation SyncShopifyStock($inventoryItemId: ID!, $locationId: ID!, $quantity: Int!) {
    inventorySetQuantities(input: {
      name: "on_hand",
      reason: "correction",
      quantities: [
        {
          inventoryItemId: $inventoryItemId
          locationId: $locationId
          quantity: $quantity
          changeFromQuantity: null
        }
      ]
    }) {
      inventoryAdjustmentGroup { createdAt }
      userErrors { message }
    }
  }`;