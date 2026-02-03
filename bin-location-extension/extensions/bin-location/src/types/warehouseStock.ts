/**
 * Represents the specific stock quantity of a product in a bin.
 * Corresponds to "bin_qty" metaobject.
 */
export interface StockItem {
  // ID of this specific stock record (bin_qty metaobject ID)
  id: string;
  // Display name of the bin location (for UI convenience)
  bin: string;
  // Quantity of items in this bin
  qty: number;
  // ID of the physical bin location definition (bin_location metaobject ID)
  binLocationId?: string;
}

/**
 * Represents the physical location definition.
 * Corresponds to "bin_location" metaobject.
 */
export interface BinLocation {
  // ID of the location definition
  id: string;
  // Unique handle/code for the location (A-01-03)
  handle?: string;
  // Human readable title/name of the location
  title?: string;
}

export interface MetaobjectField {
  key: string;
  value: string | null;
}

export interface MetaobjectFieldReference {
  id: string;
  handle: string;
  fields: MetaobjectField[];
}

export interface MetaobjectFieldWithReference extends MetaobjectField {
  reference?: MetaobjectFieldReference | null;
}

export interface MetaobjectNode {
  id: string;
  handle: string;
  fields: MetaobjectFieldWithReference[];
}

export interface WarehouseStockMetafieldNode {
  id: string;
  key: string;
  references?: {
    nodes: MetaobjectNode[];
  } | null;
}

export interface WarehouseStockResponse {
  productVariant: {
    title: string;
    product?: {
      title: string;
    } | null;
    inventoryQuantity: number;
    barcode?: string | null;
    inventoryItem: {
      id: string;
      inventoryLevels: {
        nodes: {
          location: {
            id: string;
          }
        }[];
      };
    };
    metafields: {
      nodes: WarehouseStockMetafieldNode[];
    };
  } | null;
}

export interface StaffMemberResponse {
  staffMember: {
    name?: string | null;
  } | null;
}
