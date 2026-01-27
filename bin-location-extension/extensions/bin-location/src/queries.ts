export const VARIANT_WAREHOUSE_STOCK_QUERY = /* GraphQL */ `
query VariantWarehouseStock($id: ID!) {
  productVariant(id: $id) {
    inventoryQuantity
    inventoryItem {
      id
      inventoryLevels(first: 1) {
        nodes {
          location {
            id
          }
        }
      }
    }
    metafields(first: 50) {
      nodes {
        id
        namespace
        key
        value
        type
        references(first: 100) {
          nodes {
            ... on Metaobject {
              id
              handle
              fields {
                key
                value
                reference {
                  ... on Metaobject {
                    id
                    handle
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
}`;
