-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "commission_percent" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "commission_amount" DECIMAL(65,30) NOT NULL DEFAULT 0;
