-- Convert barcode to TEXT to preserve leading zeros
ALTER TABLE "stock_movements_log"
ALTER COLUMN "barcode" TYPE TEXT
USING "barcode"::text;
