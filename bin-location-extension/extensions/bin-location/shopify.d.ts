import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/BlockExtension.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/queries.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/types/warehouseStock.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}
