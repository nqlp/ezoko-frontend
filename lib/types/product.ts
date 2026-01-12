export type ProductVariant = {
    id: string;
    title: string;
    sku: string;
    inventoryQuantity?: number;
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
