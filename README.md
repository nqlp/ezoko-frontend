# EZOKO Frontend

This project is the frontend application for Ezoko, built with Next.js and TypeScript. It interacts with the Shopify Products API to fetch product and variant data based on barcodes.

## Deployment on Railway

https://ezoko-frontend-test.up.railway.app/

## Objectives

This prototype aims to demonstrate the following functionalities:
- Fetch product variant details using barcodes.
- Display product and variant information, including images.
- Handle cases where multiple variants share the same barcode.

## Technologies Used

- Next.js (Full Stack React Framework)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- Shopify GraphQL API
- Railway (Deployment)

## Architecture (separation of responsibilities)

- **UI** (`app/`): page layout, state, and view components.
- **Use cases (Server Actions)** (`app/actions/`): input validation, error mapping.
- **Data access (Shopify)** (`lib/shopify/`): GraphQL client, queries, and API wrappers.
- **Types** (`lib/types/`): response shapes and domain models shared across layers.

### Barcode safety net

If Shopify returns **2 variants** for the same barcode (`first: 2`), the action should stop and display a meaningful error instead of rendering a product.

## Prerequisites
- `.env` file with Shopify store credentials:
  - `SHOPIFY_STORE_DOMAIN`
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
  - `SHOPIFY_API_VERSION`

- Node.js
- npm 

**Hypotheses:**
- Each product variant has a unique `barcode` valid across Shopify.

**Limits:**
- The application is read-only and does not support modifications to the inventory.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   └── getVariantByBarcode.ts   # Server Action: Handles the API call to Shopify
│   ├── scan/
│   │   └── _components/             # Components specific to the scanning feature
│   │       ├── ProductCard.tsx      # Displays image, SKU, and title
│   │       └── StockTable.tsx       # The Bin/Qty table with logic
│   ├── globals.css                  # Tailwind imports and CSS variables
│   ├── layout.tsx                   # Main layout wrapper (Fonts & Footer)
│   ├── page.tsx                     # UI orchestrator (state, events, rendering)
│
├── components/                      # Reusable UI Components
│   └── Footer.tsx                   # Footer component
│
├── lib/
│   ├── shopify/                     # Shopify API Configuration
│   │   ├── client.ts                # Generic GraphQL client
│   │   ├── productsApi.ts           # Product-specific logic
│   │   └── queries/                 # GraphQL queries
│   │       └── variantQuery.ts      # GraphQL query definition
│   └── types/                       # TypeScript Interfaces
│       ├── ApiResponse.ts
│       ├── MetaobjectField.ts       # Metaobject field shape (metafields)
│       ├── MetaobjectNode.ts        # Metaobject node shape
│       ├── ProductVariant.ts        # ProductVariant shape  
│       ├── StockLocation.ts         # Stock location metafield shape
│       └── VariantWithStock.ts      # ProductVariant + stock metafields
```

## Technical choices

- **Next.js**: Chosen for its full-stack capabilities and ease of integration with React.
- **TypeScript**: Provides type safety and better developer experience.
- **Tailwind CSS**: Enables rapid UI development with utility-first CSS.
- **Shopify GraphQL API**: Why not REST API? Since October 2024, Shopify is deprecating REST API. The GraphQL API remains the recommended approach for such queries since April 2025.

## Data flow
1. User inputs a barcode on the frontend and presses "Enter".
2. The frontend calls the `getVariantByBarcode` action with the provided barcode.
3. The backend (Server Action)`getVariantByBarcode` uses `productsApi.ts` to `findVariantsByBarcode` to fetch product variant data from Shopify.
4. Shopify processes the GraphQL query and returns the product variant data.
5. ProductsApi extracts bin locations and quantities from metafields and constructs the response.
6. The fetched data is returned to the frontend and displayed to the user.