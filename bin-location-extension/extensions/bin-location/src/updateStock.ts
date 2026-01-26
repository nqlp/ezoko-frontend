export const METAOBJECT_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateStock($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

export type UpdateStockResponse = {
  metaobjectUpdate: {
    userErrors: { message: string }[];
  };
};
