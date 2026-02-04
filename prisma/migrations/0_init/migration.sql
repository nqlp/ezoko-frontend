-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "store_integration" (
    "store_domain" TEXT NOT NULL DEFAULT 'ezokofishing.myshopify.com',
    "access_token" TEXT NOT NULL,

    CONSTRAINT "store_integration_pkey" PRIMARY KEY ("store_domain")
);
