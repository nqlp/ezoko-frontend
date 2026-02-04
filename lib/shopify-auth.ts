/**
 * Shopify OAuth Authentication Configuration
 * 
 * This module handles OAuth for mobile WMS screens.
 * It provides per-user (online) access tokens so we can track
 * which staff member performs each warehouse action.
 * 
 * NOTE: This is SEPARATE from lib/config/shopify.ts which uses
 * a stored Admin API token for system-level operations.
 */

import crypto from "crypto";

// ============================================================================
// OAuth Helper Functions
// ============================================================================

/**
 * Generate the Shopify OAuth authorization URL.
 * This is where the user will be redirected to log in.
 * 
 * @param shop - The Shopify store domain
 * @param state - A random string for CSRF protection
 */
export function getAuthorizationUrl(shop: string, state: string): string {
    const redirectUri = `${process.env.APP_URL}/api/auth/shopify/callback`;
    const scopes = process.env.SHOPIFY_OAUTH_SCOPES || "read_inventory,write_inventory";

    // Build the authorization URL for "online" (per-user) access tokens
    // The key is "grant_options[]=per-user" which gives us associated_user info
    return `https://${shop}/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_CLIENT_ID_BARCODE_SCANNER}` +
        `&scope=${scopes}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}` +
        `&grant_options[]=per-user`;
}

/**
 * Exchange the authorization code for an access token.
 * Returns both the token and the associated user info.
 * 
 * @param shop - The Shopify store domain
 * @param code - The authorization code from Shopify callback
 */
export async function exchangeCodeForToken(
    shop: string,
    code: string
): Promise<{
    accessToken: string;
    scope: string;
    expiresIn: number;
    associatedUser: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}> {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: process.env.SHOPIFY_CLIENT_ID_BARCODE_SCANNER,
            client_secret: process.env.SHOPIFY_CLIENT_SECRET_BARCODE_SCANNER,
            code,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Shopify token exchange failed:", response.status, error);
        throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        scope: data.scope,
        expiresIn: data.expires_in,
        associatedUser: {
            id: data.associated_user.id,
            firstName: data.associated_user.first_name,
            lastName: data.associated_user.last_name,
            email: data.associated_user.email,
        },
    };
}

/**
 * Generate a cryptographically secure random session token.
 * This will be stored in a cookie for session management.
 */
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a state parameter for CSRF protection.
 * This is sent in the OAuth redirect and verified in the callback.
 */
export function generateState(): string {
    return crypto.randomBytes(16).toString("hex");
}