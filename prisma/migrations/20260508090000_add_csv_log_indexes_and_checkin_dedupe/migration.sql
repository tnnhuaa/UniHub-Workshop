-- CreateIndex
CREATE INDEX "csv_import_batches_status_idx" ON "csv_import_batches"("status");

-- CreateIndex
CREATE INDEX "csv_import_batches_started_at_idx" ON "csv_import_batches"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "checkins_mssv_workshop_id_key" ON "checkins"("mssv", "workshop_id");

-- CreateIndex
CREATE INDEX "checkins_registration_id_idx" ON "checkins"("registration_id");
