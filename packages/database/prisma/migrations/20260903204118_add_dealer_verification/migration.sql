/*
  Warnings:

  - Added the required column `contactFirstName` to the `dealers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `dealers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DealerVerificationDocumentType" AS ENUM ('TRADE_LICENSE', 'COMMERCIAL_REGISTER_EXTRACT', 'OTHER');

-- AlterEnum
ALTER TYPE "DealerStatus" ADD VALUE 'NEEDS_MORE_INFORMATION';

-- AlterTable
-- contactFirstName/contactLastName zunaechst NULLABLE angelegt, mit
-- vorhandenen Bestandsdaten befuellt und danach erst auf NOT NULL gesetzt -
-- das einzige bestehende Dealer-Seed-Konto ("Julia Beispielhaendler")
-- braucht sonst einen erfundenen Platzhalterwert.
ALTER TABLE "dealers" ADD COLUMN     "commercialRegisterNumber" TEXT,
ADD COLUMN     "contactFirstName" TEXT,
ADD COLUMN     "contactLastName" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

UPDATE "dealers" d
SET "contactFirstName" = COALESCE(p."firstName", 'Unbekannt'),
    "contactLastName" = COALESCE(p."lastName", 'Unbekannt')
FROM "users" u
LEFT JOIN "profiles" p ON p."userId" = u."id"
WHERE u."id" = d."ownerUserId";

ALTER TABLE "dealers" ALTER COLUMN "contactFirstName" SET NOT NULL,
ALTER COLUMN "contactLastName" SET NOT NULL;

-- CreateTable
CREATE TABLE "dealer_verification_documents" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "documentType" "DealerVerificationDocumentType" NOT NULL DEFAULT 'TRADE_LICENSE',
    "storageKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "dealer_verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dealer_verification_documents_dealerId_idx" ON "dealer_verification_documents"("dealerId");

-- AddForeignKey
ALTER TABLE "dealer_verification_documents" ADD CONSTRAINT "dealer_verification_documents_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
