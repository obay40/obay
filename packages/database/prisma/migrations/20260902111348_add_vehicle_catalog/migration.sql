-- CreateEnum
CREATE TYPE "VehicleCatalogSource" AS ENUM ('VEHICLES_DB', 'MANUAL', 'EXTERNAL_PROVIDER');

-- CreateTable
CREATE TABLE "vehicle_manufacturers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "source" "VehicleCatalogSource" NOT NULL DEFAULT 'VEHICLES_DB',
    "sourceId" TEXT,
    "sourceVersion" TEXT,
    "sourceActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_manufacturer_aliases" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_manufacturer_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "productionStart" INTEGER,
    "productionEnd" INTEGER,
    "bodyTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "VehicleCatalogSource" NOT NULL DEFAULT 'VEHICLES_DB',
    "sourceId" TEXT,
    "sourceVersion" TEXT,
    "sourceActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_model_aliases" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_model_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_manufacturers_slug_key" ON "vehicle_manufacturers"("slug");

-- CreateIndex
CREATE INDEX "vehicle_manufacturers_isActive_idx" ON "vehicle_manufacturers"("isActive");

-- CreateIndex
CREATE INDEX "vehicle_manufacturers_isPopular_idx" ON "vehicle_manufacturers"("isPopular");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_manufacturers_source_sourceId_key" ON "vehicle_manufacturers"("source", "sourceId");

-- CreateIndex
CREATE INDEX "vehicle_manufacturer_aliases_normalizedAlias_idx" ON "vehicle_manufacturer_aliases"("normalizedAlias");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_manufacturer_aliases_manufacturerId_alias_key" ON "vehicle_manufacturer_aliases"("manufacturerId", "alias");

-- CreateIndex
CREATE INDEX "vehicle_models_manufacturerId_isActive_idx" ON "vehicle_models"("manufacturerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_manufacturerId_slug_key" ON "vehicle_models"("manufacturerId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_source_sourceId_key" ON "vehicle_models"("source", "sourceId");

-- CreateIndex
CREATE INDEX "vehicle_model_aliases_normalizedAlias_idx" ON "vehicle_model_aliases"("normalizedAlias");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_model_aliases_modelId_alias_key" ON "vehicle_model_aliases"("modelId", "alias");

-- AddForeignKey
ALTER TABLE "vehicle_manufacturer_aliases" ADD CONSTRAINT "vehicle_manufacturer_aliases_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "vehicle_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "vehicle_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model_aliases" ADD CONSTRAINT "vehicle_model_aliases_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "vehicle_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
