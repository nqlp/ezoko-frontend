import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { ProductVariant } from "@/lib/types/product";

export class ProductsApi {
  private client: ShopifyClient;
  
  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async findByBarcode(barcode: string): Promise<ProductVariant[]> {
    const query = `
      query($query: String!) {
        productVariants(first: 1, query: $query) {
          edges {
            node {
              id
              title
              sku
              image {
                url
                altText
              }
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    `;

    const result = await this.client.query<{
      productVariants: {
        edges: Array<{ node: ProductVariant }>;
      };
    }>(query, {
      query: `barcode:${barcode}`,
    });

    return result.productVariants.edges.map(edge => edge.node);
  }
}
