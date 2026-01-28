-- CreateTable
CREATE TABLE "RewardItem" (
    "id" TEXT NOT NULL,
    "store_id" TEXT,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "type" TEXT NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "value_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVoucher" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVoucher_code_key" ON "CustomerVoucher"("code");
CREATE INDEX "RewardItem_store_id_idx" ON "RewardItem"("store_id");
CREATE INDEX "CustomerVoucher_customer_id_idx" ON "CustomerVoucher"("customer_id");
CREATE INDEX "CustomerVoucher_reward_id_idx" ON "CustomerVoucher"("reward_id");

-- AddForeignKey
ALTER TABLE "RewardItem" ADD CONSTRAINT "RewardItem_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "RewardItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
