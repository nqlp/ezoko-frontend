export type ProductVariant = {
    id: string;
    title: string;
    sku: string;
    barcode?: string;
    inventoryQuantity?: number;
    createdAt?: string;
    updatedAt?: string;
    warehouse_stock?: {
        id?: string;
        namespace?: string;
        key?: string;
        type?: string;
        value?: string;
        createdAt?: string;
        updatedAt?: string;
        description?: string;
        definition?: {
            name?: string;
            description?: string;
            type?: {
                name: string;
            };
        };
        references: {
            edges: Array<{
                node: {
                    __typename: string;
                    id?: string;
                    handle?: string;
                    fields?: Array<{
                        key: string;
                        value: string;
                    }>;
                };
            }>;
        };
    } | null;

    binQty?: BinQty[];
    image?: {
        url: string;
        altText: string | null;
    };
    product: {
        title: string;
        featuredImage: {
            url: string;
            altText: string | null;
        } | null;
    };
    selectedOptions: {
        name: string;
        value: string;
    }[];
};

export type BinQty = {
    binLocation: string;
    qty: number;
};

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; message: string };
