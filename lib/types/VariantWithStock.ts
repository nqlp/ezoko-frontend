import { ProductVariant } from "./ProductVariant";
import { MetaobjectNode } from "./MetaobjectNode";

export type VariantWithStock = ProductVariant & {
    warehouse_stock?: {
        references?: {
            node: MetaobjectNode;
        };
    };
};
