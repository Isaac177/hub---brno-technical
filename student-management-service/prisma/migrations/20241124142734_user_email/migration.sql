/*
  Warnings:

  - A unique constraint covering the columns `[userEmail]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Certificate" ALTER COLUMN "pdfUrl" DROP NOT NULL,
ALTER COLUMN "verificationCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "userEmail" TEXT,
ALTER COLUMN "progress" DROP NOT NULL,
ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "transactionReference" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RevenueShare" ALTER COLUMN "schoolShare" DROP NOT NULL,
ALTER COLUMN "platformShare" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userEmail_key" ON "Enrollment"("userEmail");
