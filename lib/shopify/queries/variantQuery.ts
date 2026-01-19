export const FIND_VARIANTS_BY_BARCODE_QUERY = `
  query GetVariantByBarcode($query: String!) {
    productVariants(first: 2, query: $query) {
      nodes {
        # variant informations
        id
        title
        sku
        barcode
        displayName
        price
        inventoryQuantity
        createdAt
        updatedAt

        # image de la variante
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

        # backorder (continue / deny)
        inventoryPolicy

        position
        availableForSale
        compareAtPrice
        taxable

        # metafield variant
        metafields(first: 250) { 
          nodes {
            id
            namespace
            key
            value
            type
            references(first: 10) {
              nodes {
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

        # price
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
        }

        # product associated to the variant
        product {
          title
          # image de la variante
          featuredMedia {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
        
        # options for variant
        selectedOptions {
          name
          value
        }
      } 
    }
  }
`;