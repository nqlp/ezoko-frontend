export const UPDATE_METAOBJECT_QTY = /* GraphQL */`
mutation UpdateBinQtyByID($id: ID!, $newQty: String!) {
  metaobjectUpdate(id: $id, metaobject: {
    fields: [
      {
        key: "qty",
        value: $newQty
      }
    ]
  }) {
    metaobject {
      id
      displayName
      field(key: "qty") {
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}`