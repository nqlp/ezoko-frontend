-- Activity Enum
CREATE TYPE "Activity" AS ENUM ('Correction', 'Goods RECEIPT', 'Movement', 'Picking', 'Goods Issue', 'Inv Counting');

-- CreateTable
CREATE TABLE "stock_movements_log" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT,
    "activity" "Activity" NOT NULL,
    "barcode" BIGINT,
    "variant_id" TEXT,
    "src_location" TEXT,
    "src_qty" INTEGER,
    "destination_location" TEXT,
    "reference_doc" TEXT,

    CONSTRAINT "stock_movements_log_pkey" PRIMARY KEY ("id")
);
