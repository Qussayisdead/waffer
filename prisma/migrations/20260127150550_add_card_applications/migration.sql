-- DropIndex
DROP INDEX "AuditLog_actor_id_idx";

-- DropIndex
DROP INDEX "AuditLog_store_id_idx";

-- DropIndex
DROP INDEX "CardQrToken_card_id_idx";

-- DropIndex
DROP INDEX "CardQrToken_source_idx";

-- DropIndex
DROP INDEX "CustomerVoucher_customer_id_idx";

-- DropIndex
DROP INDEX "CustomerVoucher_reward_id_idx";

-- DropIndex
DROP INDEX "PointsTransaction_customer_id_idx";

-- DropIndex
DROP INDEX "PointsTransaction_invoice_id_idx";

-- DropIndex
DROP INDEX "RewardItem_store_id_idx";

-- CreateTable
CREATE TABLE "CardApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "card_type" TEXT NOT NULL DEFAULT 'golden',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardApplication_pkey" PRIMARY KEY ("id")
);
