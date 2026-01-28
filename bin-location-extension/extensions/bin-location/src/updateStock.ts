import { MetaobjectField } from "./types/warehouseStock";

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

export type SearchBinLocationsResponse = {
  metaobjects: {
    nodes: {
      id: string;
      handle: string;
      fields: MetaobjectField[];
    }[];
  };
};

export const METAOBJECT_CREATE_BIN_QTY_MUTATION = /* GraphQL */ `
  mutation CreateBinQty($type: String!, $handle: String!, $binLocationId: ID!, $qty: String!) {
    metaobjectCreate(metaobject: {
      type: $type
      handle: $handle
      fields: [
        {
          key: "bin_location"
          value: $binLocationId
        }
        {
          key: "qty"
          value: $qty
        }
      ]
    }) {
      metaobject { id }
      userErrors { field message }
    }
  }
;`

export const METAFIELDS_SET_MUTATION = /* GraphQL */ `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        type
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type CreateBinQtyResponse = {
  metaobjectCreate: {
    metaobject: { id: string };
    userErrors: { field: string; message: string }[];
  };
};

export type MetafieldsSetResponse = {
  metafieldsSet: {
    metafields: {
      id: string;
      value: string;
    }[];
    userErrors: { field: string; message: string }[];
  };
};
