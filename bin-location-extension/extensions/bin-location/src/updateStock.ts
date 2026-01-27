export const METAOBJECT_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateStock($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

export const INVENTORY_SET_QUANTITIES_MUTATION = /* GraphQL */ `
  mutation InventorySetQuantities($inventoryItemId: ID!, $locationId: ID!, $quantity: Int!) {
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
      inventoryAdjustmentGroup { id }
      userErrors { field message }
    }
  }
`;

export type UpdateStockResponse = {
  metaobjectUpdate: {
    userErrors: { message: string }[];
  };
};

export type InventorySetResponse = {
  inventorySetQuantities: {
    userErrors: { message: string }[];
  };
};
