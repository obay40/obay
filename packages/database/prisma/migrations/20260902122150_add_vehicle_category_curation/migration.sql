-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('PASSENGER_CAR', 'MOTORCYCLE', 'COMMERCIAL_VEHICLE', 'MOTORHOME', 'TRUCK', 'BUS', 'TRAILER', 'AGRICULTURAL', 'SPECIAL_VEHICLE', 'OTHER', 'MULTI_CATEGORY');

-- CreateEnum
CREATE TYPE "VehicleCurationStatus" AS ENUM ('AUTO_APPROVED', 'AUTO_EXCLUDED', 'MANUAL_APPROVED', 'MANUAL_EXCLUDED', 'REVIEW_REQUIRED');

-- AlterTable
ALTER TABLE "vehicle_manufacturers" ADD COLUMN     "category" "VehicleCategory" NOT NULL DEFAULT 'PASSENGER_CAR';

-- AlterTable
ALTER TABLE "vehicle_models" ADD COLUMN     "curationStatus" "VehicleCurationStatus" NOT NULL DEFAULT 'AUTO_APPROVED',
ADD COLUMN     "isHistoric" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisibleInPassengerCarSearch" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vehicleCategory" "VehicleCategory" NOT NULL DEFAULT 'PASSENGER_CAR';

-- CreateIndex
CREATE INDEX "vehicle_manufacturers_category_idx" ON "vehicle_manufacturers"("category");

-- CreateIndex
CREATE INDEX "vehicle_models_manufacturerId_isVisibleInPassengerCarSearch_idx" ON "vehicle_models"("manufacturerId", "isVisibleInPassengerCarSearch");

-- CreateIndex
CREATE INDEX "vehicle_models_vehicleCategory_idx" ON "vehicle_models"("vehicleCategory");
