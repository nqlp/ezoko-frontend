export type UserError = {
  field: string[] | null;
  message: string;
};

export type MetaobjectUpdatePayload = {
  metaobjectUpdate: {
    metaobject: {
      id: string;
      displayName: string;
      field?: {
        value: string;
      } | null;
    } | null;
    userErrors: UserError[];
  };
};