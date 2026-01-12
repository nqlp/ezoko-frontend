"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse, BinQty } from "@/lib/types/product";

export async function getBinQty(barcode: string): Promise<ApiResponse<BinQty[]>> {
    try {
        const client = new ShopifyClient();
        const repository = new ProductsApi(client);
        const result = await repository.findBinQtyByBarcode(barcode);

        if (result.variantCount > 1) {
            return {
                success: false,
                message: `Erreur critique: Ce code-barres (${barcode}) est assigné à ${result.variantCount} variantes différentes. 
                  Veuillez corriger dans Shopify.`
            };
        }

        return { success: true, data: result.entries };
    } catch (error) {
        console.error("Error fetching bin quantity:", error);

        if (error instanceof Error) {
            return { success: false, message: error.message };
        }

        return { success: false, message: "Erreur serveur" };
    }
}
