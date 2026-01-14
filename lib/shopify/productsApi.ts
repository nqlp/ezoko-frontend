import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { BinQty, ProductVariant } from "@/lib/types/product";

type MetaobjectNode = {
  __typename: string;
  id?: string;
  fields?: MetaobjectField[];
};

type MetaobjectField = {
  key: string;
  value: string;
  reference?: {
    fields: Array<{ key: string; value: string }>;
  } | null;
};

export class ProductsApi {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async getVariantsByBarcode(barcode: string): Promise<ProductVariant[]> {
    const query = `
    query GetVariantsByBarcode($query: String!) {
      productVariants(first: 2, query: $query) {
        edges {
          node {
            id
            title
            sku
            barcode
            inventoryQuantity
            createdAt
            updatedAt

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

            warehouse_stock: metafield(namespace: "custom", key: "warehouse_stock") {
              id
              namespace
              key
              type
              value
              createdAt
              updatedAt
              description
              
              definition {
                name
                description
                type {
                  name
                }
              }

              references(first: 20) {
                edges {
                  node {
                    __typename
                    ... on Metaobject {
                      id
                      handle
                      fields {
                        key
                        value
                      }
                    }

                    ... on ProductVariant {
                      id
                      title
                      sku
                      barcode
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
          node: ProductVariant & {
            warehouse_stock?: {
              id: string;
              title: string
              sku: string;
              barcode?: string;
              namespace?: string;
              key?: string;
              type?: string;
              value?: string;
              createdAt?: string;
              updatedAt?: string;
              description?: string;
              definition?: {
                name?: string;
                description?: string;
                type?: {
                  name: string;
                };
              };
              references: {
                edges: Array<{
                  node: {
                    __typename: string;
                    id?: string;
                    handle?: string;
                    fields?: Array<{
                      key: string;
                      value: string;
                    }>;
                  };
                }>;
              };
            } | null;
          };
        }>;
      };
    }>(query, {
      query: `barcode:${barcode}`,
    });

    const edges = result.productVariants.edges;

    // Si on n'a pas de resultats, retourner un tableau vide
    if (edges.length === 0) {
      return [];
    }

    // Helper to parse metaobject IDs from the metafield value.
    const parseMetaobjectIds = (value?: string | null): string[] => {
      if (!value) return [];
      const trimmed = value.trim();
      if (!trimmed) return [];

      // Handle JSON list of IDs: ["gid://..."]
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter((id): id is string => typeof id === "string");
          }
        } catch {
          return [];
        }
      }

      // Handle single ID: "gid://..."
      if (trimmed.startsWith("gid://")) {
        return [trimmed];
      }

      return [];
    };

    // Map : Variant ID -> Liste d'IDs de Metaobjects
    const metaobjectIdsByVariantId = new Map<string, string[]>();
    // Set : IDs uniques à fetcher en une seule requête
    const metaobjectIds = new Set<string>();

    for (const edge of edges) {
      const ids = parseMetaobjectIds(edge.node.warehouse_stock?.value);
      if (ids.length > 0) {
        metaobjectIdsByVariantId.set(edge.node.id, ids);
        ids.forEach((id) => metaobjectIds.add(id));
      }
    }

    // Map : Metaobject ID -> Champs (bin/qty)
    const metaobjectsById = new Map<string, { fields: MetaobjectField[] }>();

    if (metaobjectIds.size > 0) {
      const metaobjectsQuery = `
        query($ids: [ID!]!) {
          nodes(ids: $ids) {
            __typename
            ... on Metaobject {
              id
              handle
              fields {
                key
                value
                reference {
                  ... on Metaobject {
                    fields { key value }
                  }
                }
              }
            }
          }
        }
      `;

      const metaobjectsResult = await this.client.query<{
        nodes: Array<MetaobjectNode | null>;
      }>(metaobjectsQuery, { ids: Array.from(metaobjectIds) });

      // Remplir la map avec les résultats valides
      for (const node of metaobjectsResult.nodes) {
        if (node && node.__typename === "Metaobject" && node.id && node.fields) {
          metaobjectsById.set(node.id, { fields: node.fields });
        }
      }
    }

    const getQtyFromFields = (fields: MetaobjectField[]): number => {
      // Chercher la quantité (clé "qty") et la normaliser.
      const qtyField = fields.find((field) => field.key === "qty");
      const qty = Number.parseFloat(qtyField?.value ?? "0");
      return Number.isFinite(qty) ? qty : 0;
    };

    const getBinFromFields = (fields: MetaobjectField[]): string => {
      // Bin direct sur le metaobject (clé "bin")
      const binFromMetaobject = fields.find((field) => field.key === "bin")?.value;
      if (binFromMetaobject && binFromMetaobject.trim()) {
        return binFromMetaobject.trim();
      }

      // Bin dans une référence (ex: metaobject lié)
      for (const field of fields) {
        const referenceFields = field.reference?.fields ?? [];
        const refBin = referenceFields.find((ref) => ref.key === "bin")?.value;
        if (refBin && refBin.trim()) {
          return refBin.trim();
        }
      }

      return "";
    };

    const extractBinQty = (fields: MetaobjectField[]): BinQty | null => {
      // Fabrique un couple { binLocation, qty } ou null si rien d'utile
      const qty = getQtyFromFields(fields);
      const bin = getBinFromFields(fields);

      if (!bin) {
        return qty > 0 ? { binLocation: "Unknown Bin", qty } : null;
      }

      return { binLocation: bin, qty };
    };

    const variants = edges.map((edge) => {
      const variant = edge.node;
      const metaobjectIdsForVariant = metaobjectIdsByVariantId.get(variant.id) ?? [];

      // Résoudre les metaobjects en BinQty en gardant uniquement les entrées valides
      const binQty = metaobjectIdsForVariant
        .map((id) => metaobjectsById.get(id))
        .filter(
          (metaobject): metaobject is { fields: MetaobjectField[] } =>
            Boolean(metaobject)
        )
        .map((metaobject) => extractBinQty(metaobject.fields))
        .filter((entry): entry is BinQty => Boolean(entry));

      return {
        ...variant,
        binQty,
      };
    });
    return variants;
  }
}
