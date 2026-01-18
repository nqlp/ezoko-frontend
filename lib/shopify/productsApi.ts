import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import { FIND_VARIANTS_BY_BARCODE_QUERY } from "@/lib/shopify/queries/variantQuery";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { MetaobjectField } from "@/lib/types/MetaobjectField";

export class ProductsApi {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async findVariantsByBarcode(barcode: string): Promise<ProductVariant[]> {
    const result = await this.client.query<{
      productVariants: {
        nodes: VariantWithStock[];
      };
    }>(FIND_VARIANTS_BY_BARCODE_QUERY, {
      query: `barcode:${barcode}`,
    });

    const variants = result.productVariants.nodes;

    if (variants.length === 0) return [];

    const variantsWithStock = variants.map((variant) => {
      const stockMetafield = variant.metafields?.edges.find(
        (edge) => edge.node.key === "warehouse_stock"
      );
      const stockEdges = stockMetafield?.node.references?.edges || [];

      const binQty: StockLocation[] = [];

      const getBinName = (fields: MetaobjectField[], fallbackHandle: string) => {
        const binField = fields.find((field) => field.key === "bin_location");
        const referenceFields = binField?.reference?.fields ?? [];
        const referenceValue = referenceFields.find((f) => f.key === "bin_location")?.value;
        if (referenceValue) {
          return referenceValue;
        }

        if (binField?.reference?.handle) {
          return binField.reference.handle;
        }

        return fallbackHandle || "Unknown";
      };

      for (const edge of stockEdges) {
        const fields = edge.node.fields || [];
        const binName = getBinName(fields, edge.node.handle);

        const qtyField = fields.find((field) => field.key === "qty");
        const parsedQty = Number.parseFloat(qtyField?.value ?? "0");
        const qty = Number.isFinite(parsedQty) ? parsedQty : 0;

        if (qty > 0) {
          binQty.push({
            binLocation: binName,
            qty: qty,
          });
        }
      }

      return {
        ...variant,
        binQty: binQty,
      };
    });

    return variantsWithStock;
  }
}
