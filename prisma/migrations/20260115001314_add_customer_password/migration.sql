-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password_hash" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "currency" SET DEFAULT 'ILS';
