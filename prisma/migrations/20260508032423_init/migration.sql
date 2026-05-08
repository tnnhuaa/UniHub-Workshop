-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('student', 'organizer', 'checkin_staff');

-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('draft', 'published', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "CheckinSyncStatus" AS ENUM ('pending', 'synced', 'rejected');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'in_app', 'telegram');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "better_auth_users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "id_token" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "better_auth_verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_auth_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "UserRoleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "mssv" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "faculty" TEXT,
    "class_name" TEXT,
    "status" TEXT,
    "better_auth_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "csv_synced_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("mssv")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "speaker" TEXT,
    "room" TEXT,
    "capacity" INTEGER NOT NULL,
    "registered_count" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "WorkshopStatus" NOT NULL DEFAULT 'draft',
    "floor_map_url" TEXT,
    "organizer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "mssv" TEXT NOT NULL,
    "workshop_id" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'pending',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "qr_code" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_completed_at" TIMESTAMP(3),
    "held_until" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "mssv" TEXT NOT NULL,
    "workshop_id" TEXT NOT NULL,
    "checkin_staff_id" TEXT,
    "registration_id" TEXT,
    "device_event_id" TEXT,
    "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    "sync_status" "CheckinSyncStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_workshop_assignments" (
    "id" TEXT NOT NULL,
    "staff_user_id" TEXT NOT NULL,
    "workshop_id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'active',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_workshop_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_documents" (
    "id" TEXT NOT NULL,
    "workshop_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "processing_status" "DocumentProcessingStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshop_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_summary_jobs" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "summary_text" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_summary_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "template_code" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "dedupe_key" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_import_batches" (
    "id" TEXT NOT NULL,
    "source_file" TEXT NOT NULL,
    "total_records" INTEGER NOT NULL,
    "successful_records" INTEGER NOT NULL,
    "failed_records" INTEGER NOT NULL,
    "conflict_records" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "csv_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_import_errors" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "raw_row" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "csv_import_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_users_email_key" ON "better_auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "better_auth_sessions_token_key" ON "better_auth_sessions"("token");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_better_auth_user_id_key" ON "students"("better_auth_user_id");

-- CreateIndex
CREATE INDEX "workshops_organizer_id_idx" ON "workshops"("organizer_id");

-- CreateIndex
CREATE INDEX "registrations_mssv_idx" ON "registrations"("mssv");

-- CreateIndex
CREATE INDEX "registrations_workshop_id_idx" ON "registrations"("workshop_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_ref_key" ON "payments"("provider_ref");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_registration_id_idx" ON "payments"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkins_device_event_id_key" ON "checkins"("device_event_id");

-- CreateIndex
CREATE INDEX "checkins_mssv_idx" ON "checkins"("mssv");

-- CreateIndex
CREATE INDEX "checkins_workshop_id_idx" ON "checkins"("workshop_id");

-- CreateIndex
CREATE INDEX "staff_workshop_assignments_staff_user_id_idx" ON "staff_workshop_assignments"("staff_user_id");

-- CreateIndex
CREATE INDEX "staff_workshop_assignments_workshop_id_idx" ON "staff_workshop_assignments"("workshop_id");

-- CreateIndex
CREATE INDEX "workshop_documents_workshop_id_idx" ON "workshop_documents"("workshop_id");

-- CreateIndex
CREATE INDEX "ai_summary_jobs_document_id_idx" ON "ai_summary_jobs"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_dedupe_key_key" ON "notification_deliveries"("dedupe_key");

-- CreateIndex
CREATE INDEX "notification_deliveries_user_id_idx" ON "notification_deliveries"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "csv_import_errors_batch_id_idx" ON "csv_import_errors"("batch_id");

-- AddForeignKey
ALTER TABLE "better_auth_sessions" ADD CONSTRAINT "better_auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "better_auth_accounts" ADD CONSTRAINT "better_auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_better_auth_user_id_fkey" FOREIGN KEY ("better_auth_user_id") REFERENCES "better_auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "better_auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_mssv_fkey" FOREIGN KEY ("mssv") REFERENCES "students"("mssv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_mssv_fkey" FOREIGN KEY ("mssv") REFERENCES "students"("mssv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_checkin_staff_id_fkey" FOREIGN KEY ("checkin_staff_id") REFERENCES "better_auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_workshop_assignments" ADD CONSTRAINT "staff_workshop_assignments_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_workshop_assignments" ADD CONSTRAINT "staff_workshop_assignments_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_documents" ADD CONSTRAINT "workshop_documents_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summary_jobs" ADD CONSTRAINT "ai_summary_jobs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "workshop_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "better_auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csv_import_errors" ADD CONSTRAINT "csv_import_errors_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "csv_import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
