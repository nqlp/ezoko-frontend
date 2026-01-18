import { MetaobjectField } from "./MetaobjectField";

export type MetaobjectNode = {
  __typename: string;
  handle: string;
  fields: MetaobjectField[];
};