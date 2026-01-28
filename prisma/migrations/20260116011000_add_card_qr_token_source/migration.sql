-- AlterTable
ALTER TABLE "CardQrToken" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'customer';

-- CreateIndex
CREATE INDEX "CardQrToken_source_idx" ON "CardQrToken"("source");
