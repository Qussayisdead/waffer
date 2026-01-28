-- AlterTable
ALTER TABLE "RewardItem" ADD COLUMN     "expiry_days" INTEGER NOT NULL DEFAULT 7;

-- Update default reward expiry
UPDATE "RewardItem" SET "expiry_days" = 7 WHERE "expiry_days" IS NULL;
