export interface StockItem {
  id: string;
  bin: string;
  qty: number;
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
    metafields: {
      nodes: WarehouseStockMetafieldNode[];
    };
  } | null;
}
