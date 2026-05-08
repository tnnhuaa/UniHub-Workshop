-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_mssv_workshop_id_key" ON "registrations"("mssv", "workshop_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_workshop_assignments_staff_user_id_workshop_id_key" ON "staff_workshop_assignments"("staff_user_id", "workshop_id");
