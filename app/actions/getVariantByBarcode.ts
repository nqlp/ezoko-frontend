"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";

export async function getVariantByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant>> {
  try {
    const client = new ShopifyClient();
    const productApi = new ProductsApi(client);

    const productVariants = await productApi.findVariantsByBarcode(barcode);

    // safety net: there should never be more than 1 variant per barcode
    if (productVariants.length > 1) {
      return {
        success: false,
        message: `Error: Multiple variants found with the same barcode (${barcode}). Please make the changes in Shopify.`,
      };
    }

    return { success: true, data: productVariants[0] };
  } catch (error) {
    console.error("Error fetching product by barcode:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return { success: false, message: "Erreur serveur" };
  }
}
