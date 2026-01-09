import { ShopifyClient } from "@/lib/services/shopify-client";
import { ProductVariant } from "@/lib/types/product";

export class ProductRepository {
  constructor(private client: ShopifyClient) {}

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
                src
                altText
              }
              product {
                title
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
