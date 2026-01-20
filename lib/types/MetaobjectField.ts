export type MetaobjectField = {
  key: string;
  value: string;
  reference?: {
    handle?: string;
    fields?: Array<{ key: string; value: string }>;
  } | null;
};