"use server";

import { ShopifyClient } from "@/lib/services/shopify-client";
import { ProductRepository } from "@/lib/repositories/product-repository";
import { ApiResponse, ProductVariant } from "@/lib/types/product";

export async function getProductByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant[]>> {
  try {
    const client = new ShopifyClient();
    const repository = new ProductRepository(client);
    
    const products = await repository.findByBarcode(barcode);
    
    return { success: true, data: products };
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    
    return { success: false, message: "Erreur serveur" };
  }
}