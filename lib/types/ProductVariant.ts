import { StockLocation } from "./StockLocation";

export type ProductVariant = {
    id: string;
    title: string;
    sku: string;
    barcode?: string;
    displayName?: string;
    createdAt: string;
    updatedAt: string;
    taxable: boolean;
    availableForSale: boolean;
    position: number;
    inventoryQuantity?: number;

    // image de la variante
    media?: {
        nodes: Array<{
            image?: {
                url: string;
                altText: string | null;
            } | null;
        }>;
    } | null;

    product?: {
        title: string;
        // image du produit
        featuredMedia?: {
            image?: {
                url: string;
                altText: string | null;
            } | null;
        } | null;
    } | null;

    // options for variant
    selectedOptions: {
        name: string;
        value: string;
    }[];

    price: {
        amount: string;
        currencyCode: string;
    };

    compareAtPrice?: {
        amount: string;
        currencyCode: string;
    } | null;

    metafields: {
        edges: Array<{
            node: {
                id: string;
                namespace: string;
                key: string;
                value: string;
                references?: {
                    edges: Array<{
                        node: {
                            handle: string;
                            fields: {
                                key: string;
                                value: string;
                                reference?: {
                                    handle?: string;
                                    fields?: { key: string; value: string }[];
                                } | null;
                            }[];
                        };
                    }>;
                };
            };
        }>;
    };

    binQty?: StockLocation[];
};
