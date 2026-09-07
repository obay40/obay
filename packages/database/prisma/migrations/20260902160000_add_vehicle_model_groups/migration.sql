-- CreateTable
CREATE TABLE "vehicle_model_groups" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "source" "VehicleCatalogSource" NOT NULL DEFAULT 'MOBILE_DE',
    "sourceId" TEXT,
    "sourceVersion" TEXT,
    "sourceActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_model_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_model_groups_manufacturerId_isActive_idx" ON "vehicle_model_groups"("manufacturerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_model_groups_source_sourceId_key" ON "vehicle_model_groups"("source", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_model_groups_manufacturerId_slug_key" ON "vehicle_model_groups"("manufacturerId", "slug");

-- AddForeignKey
ALTER TABLE "vehicle_model_groups" ADD CONSTRAINT "vehicle_model_groups_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "vehicle_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "vehicle_models" ADD COLUMN "groupId" TEXT;

-- CreateIndex
CREATE INDEX "vehicle_models_groupId_idx" ON "vehicle_models"("groupId");

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "vehicle_model_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
