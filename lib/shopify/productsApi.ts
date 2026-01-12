import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { BinQty, ProductVariant } from "@/lib/types/product";

export class ProductsApi {
  private client: ShopifyClient;
  
  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async findByBarcode(barcode: string): Promise<ProductVariant[]> {
    const query = `
      query($query: String!) {
        productVariants(first: 2, query: $query) {
          edges {
            node {
              id
              title
              sku
              inventoryQuantity
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

  async findBinQtyByBarcode(
    barcode: string
  ): Promise<{ entries: BinQty[]; variantCount: number }> {
    const query = `
      query($query: String!) {
        productVariants(first: 2, query: $query) {
          edges {
            node {
              metafield(namespace: "custom", key: "warehouse_stock") {
                references(first: 50) {
                  edges {
                    node {
                      ... on Metaobject {
                        fields {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.client.query<{
      productVariants: {
        edges: Array<{
          node: {
            metafield?: {
              references?: {
                edges: Array<{
                  node: {
                    fields: Array<{ key: string; value: string }>;
                  };
                }>;
              };
            } | null;
          };
        }>;
      };
    }>(query, { query: `barcode:${barcode}` });

    const edges = result.productVariants.edges;
    const variantCount = edges.length;
    const metaEdges =
      edges[0]?.node.metafield?.references?.edges ?? [];

    const entries = metaEdges
      .map((edge) => {
        const fields = edge.node.fields;
        const binLocation =
          fields.find((field) => field.key === "bin_location")?.value ??
          fields.find((field) => field.key === "binLocation")?.value ??
          "";
        const qtyRaw =
          fields.find((field) => field.key === "qty")?.value ??
          fields.find((field) => field.key === "Qty")?.value ??
          "0";
        const qty = Number.parseFloat(qtyRaw);

        if (!binLocation) {
          return null;
        }

        return {
          binLocation,
          qty: Number.isFinite(qty) ? qty : 0,
        };
      })
      .filter((entry): entry is BinQty => entry !== null);

    return { entries, variantCount };
  }
}
