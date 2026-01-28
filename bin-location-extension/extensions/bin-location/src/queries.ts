export const VARIANT_WAREHOUSE_STOCK_QUERY = /* GraphQL */ `
query VariantWarehouseStock($id: ID!) {
  productVariant(id: $id) {
    inventoryQuantity
    barcode
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

export const SEARCH_BIN_LOCATIONS_QUERY = /* GraphQL */ `
query SearchBinLocations($query: String!) {
  metaobjects(type: "bin_location", first: 10, query: $query) {
    nodes {
      id
      handle
      fields {
        key
        value
      }
    }
  }
}
`;
