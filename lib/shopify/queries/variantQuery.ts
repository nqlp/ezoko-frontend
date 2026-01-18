export const FIND_VARIANTS_BY_BARCODE_QUERY = `
  query GetVariantByBarcode($query: String!) {
    productVariants(first: 2, query: $query) {
        nodes {
          # Info de la variante 
          id
          title
          sku
          barcode
          displayName
          price
          inventoryQuantity
          createdAt
          updatedAt

          # Image de la variante
          media(first: 1) {
            nodes {
                ... on MediaImage {
                    image {
                      url
                      altText
                }
              }
            }
          }

          # allow customers to purchase when out of stock (continue / deny)
          inventoryPolicy

          # position dans la liste des variantes du produit
          position
          availableForSale
          compareAtPrice
          taxable

          metafields(first: 50) { 
            edges {
              node {
                id
                namespace
                key
                value
                type
                references(first: 10) {
                  edges {
                    node {
                      ... on Metaobject {
                        handle
                        fields {
                          key
                          value
                          reference {
                            ... on Metaobject {
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
          }


          # warehouse_stock: metafield(namespace: "custom", key: "warehouse_stock") {
          #   id
          #   key
          #   value
          #   references(first: 20) {
          #     edges {
          #       node {
          #         __typename
          #         ... on Metaobject {
          #           id
          #           handle
          #           fields {
          #             key
          #             value
          #             reference {
          #               ... on Metaobject {
          #                 handle
          #                 fields {
          #                   key
          #                   value
          #                 }
          #               }
          #             }
          #           }
          #         }
          #       }
          #     }
          #   }
          # }
          
          unitPrice {
            amount
            currencyCode
          }

          unitPriceMeasurement {
            measuredType
            quantityUnit
          }

          inventoryItem {
            tracked
            countryCodeOfOrigin
            provinceCodeOfOrigin
            measurement {
                id
                weight {
                    unit
                    value
                }
            }
          }

          product {
            title
            # image du produit 
            featuredMedia {
                ... on MediaImage {
                    image {
                        url
                        altText
                    }
                }
            }
          }
        
          selectedOptions {
            name
            value
            optionValue {
              id
              hasVariants
          }
        }
      }
    }
  }
`;
