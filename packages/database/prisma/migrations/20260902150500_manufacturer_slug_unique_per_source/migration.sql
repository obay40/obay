-- DropIndex
DROP INDEX "vehicle_manufacturers_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_manufacturers_source_slug_key" ON "vehicle_manufacturers"("source", "slug");
