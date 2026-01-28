-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "points_balance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "points_earned" INTEGER NOT NULL DEFAULT 0;
