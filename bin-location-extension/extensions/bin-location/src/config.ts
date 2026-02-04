/**
 * Extension configuration
 * 
 * NOTE: Shopify Admin UI Extensions run in a browser sandbox without access to process.env.
 * This file provides build-time configuration values.
 */

// API endpoint for stock movement logging
// Change this when deploying to production
export const API_STOCK_MOVEMENTS_LOGS = "https://ezoko-frontend-test.up.railway.app/api/stock-movements_logs";

// For future use: production URL
// export const API_STOCK_MOVEMENTS_LOGS = "https://ezoko-frontend.up.railway.app/api/stock-movements_logs";
