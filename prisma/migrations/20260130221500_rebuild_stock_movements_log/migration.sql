-- Rebuild stock_movements_log to enforce column order
CREATE TABLE "stock_movements_log_new" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT,
    "activity" "Activity" NOT NULL,
    "barcode" BIGINT,
    "variant_id" TEXT,
    "src_location" TEXT,
    "src_qty" INTEGER,
    "destination_location" TEXT,
    "destination_qty" INTEGER,
    "reference_doc" TEXT,

    CONSTRAINT "stock_movements_log_new_pkey" PRIMARY KEY ("id")
);

INSERT INTO "stock_movements_log_new" (
    "id",
    "created_at",
    "user",
    "activity",
    "barcode",
    "variant_id",
    "src_location",
    "src_qty",
    "destination_location",
    "destination_qty",
    "reference_doc"
)
SELECT
    "id",
    "created_at",
    "user",
    "activity",
    "barcode",
    "variant_id",
    "src_location",
    "src_qty",
    "destination_location",
    "destination_qty",
    "reference_doc"
FROM "stock_movements_log";

DROP TABLE "stock_movements_log";

ALTER TABLE "stock_movements_log_new" RENAME TO "stock_movements_log";
ALTER TABLE "stock_movements_log" RENAME CONSTRAINT "stock_movements_log_new_pkey" TO "stock_movements_log_pkey";
