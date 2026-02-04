-- Add destination qty to stock movements log
ALTER TABLE "stock_movements_log"
ADD COLUMN "destination_qty" INTEGER;
