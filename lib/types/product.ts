export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  image?: {
    src: string;
    altText: string | null;
  };
  product: {
    title: string;
  };
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; message: string };
