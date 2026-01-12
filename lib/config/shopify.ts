const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-10";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const apiUrl =
    process.env.SHOPIFY_API_URL ||
    (storeDomain
        ? `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`
        : "https://ezokofishing.myshopify.com/admin/api/2025-10/graphql.json");

export const shopifyConfig = {
    apiUrl,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion,
} as const;

export function validateShopifyConfig() {
    if (!shopifyConfig.accessToken) {
        throw new Error("SHOPIFY_ACCESS_TOKEN is required");
    }
    if (!shopifyConfig.apiUrl) {
        throw new Error("SHOPIFY_API_URL or SHOPIFY_STORE_DOMAIN is required");
    }
}