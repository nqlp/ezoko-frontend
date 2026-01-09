export type ProductVariant = {
    id: string;
    title: string;
    sku: string;
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

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; message: string };
