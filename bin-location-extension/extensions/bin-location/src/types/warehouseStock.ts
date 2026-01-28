export interface StockItem {
  id: string;
  bin: string;
  qty: number;
  binLocationId?: string;
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
