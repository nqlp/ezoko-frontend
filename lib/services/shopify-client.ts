import { shopifyConfig, validateShopifyConfig } from "@/lib/config/shopify";

export class ShopifyClient {
  private apiUrl: string;
  private accessToken: string;

  constructor() {
    validateShopifyConfig();
    this.apiUrl = shopifyConfig.apiUrl;
    this.accessToken = shopifyConfig.accessToken!;
  }

  async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    const json = await response.json();
    
    if (json.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
  }
}
