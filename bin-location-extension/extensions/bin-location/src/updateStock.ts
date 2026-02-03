import { MetaobjectField } from "./types/warehouseStock";

/** Fetch metaobject by ID 
 *  Update existing metaobject fields
 *  Return updated metaobject ID
 * */

export const METAOBJECT_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateStock($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) { # object: key: "qty", value: "15"
      metaobject { id } # ID: gid://shopify/Metaobject/123
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
  mutation CreateBinQty($type: String!, $handle: String!, $binLocationId: String!, $qty: String!, $variantId: String!) {
    metaobjectCreate(metaobject: {
    # type: bin_qty
      type: $type
      handle: $handle
      fields: [
        {
          key: "bin_location"
          value: $binLocationId
        }
        {
          key: "product_variant"
          value: $variantId
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
`;

export const METAOBJECT_CREATE_BIN_LOCATION_MUTATION = /* GraphQL */ `
  mutation CreateBinLocation($type: String!, $handle: String!, $title: String!) {
    metaobjectCreate(metaobject: {
    # type: bin_location
      type: $type
      handle: $handle
      fields: [
        {
          key: "bin_location"
          value: $title
        }
      ]
    }) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;

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

export type CreateBinLocationResponse = {
  metaobjectCreate: {
    metaobject: { id: string; handle?: string | null };
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

export const STAFF_MEMBER_QUERY = /* GraphQL */ `
  query StaffMember($id: ID!) {
    staffMember(id: $id) {
      firstName
      lastName
    }
  }
`;

export type StaffMemberResponse = {
  staffMember: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};
