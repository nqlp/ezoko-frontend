export const shopifyConfig = {
    apiUrl: process.env.SHOPIFY_API_URL || "https://ezokofishing.myshopify.com/admin/api/2025-10/graphql.json",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION || "2025-10",
} as const;

export function validateShopifyConfig() {
    if (!shopifyConfig.accessToken) {
        throw new Error("SHOPIFY_ACCESS_TOKEN is required");
    }
}
