"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse, ProductVariant } from "@/lib/types/product";

export async function getVariantByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant[]>> {
  try {
    const client = new ShopifyClient();
    const productApi = new ProductsApi(client);

    const productsVariants = await productApi.getVariantsByBarcode(barcode);

    // safety net: there should never be more than 1 product per barcode
    if (productsVariants.length > 1) {
      return {
        success: false,
        message: `Erreur critique: Ce code-barres (${barcode}) est assigné à ${productsVariants.length} variantes différentes. 
                  Veuillez corriger dans Shopify.`
      }
    }

    return { success: true, data: productsVariants };
  } catch (error) {
    console.error("Error fetching product by barcode:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return { success: false, message: "Erreur serveur" };
  }
}
