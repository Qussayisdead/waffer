-- CreateTable
CREATE TABLE "CardQrToken" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardQrToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardQrToken_token_key" ON "CardQrToken"("token");
CREATE INDEX "CardQrToken_card_id_idx" ON "CardQrToken"("card_id");

-- AddForeignKey
ALTER TABLE "CardQrToken" ADD CONSTRAINT "CardQrToken_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
