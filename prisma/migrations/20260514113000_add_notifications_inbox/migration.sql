-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('custom', 'workshop_registration_confirmed');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "event_key" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "notification_deliveries"
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "notification_id" TEXT,
ADD COLUMN     "provider_ref" TEXT;

-- Backfill notifications from existing deliveries before removing legacy columns.
INSERT INTO "notifications" ("id", "user_id", "type", "title", "body", "created_at")
SELECT
    'legacy-' || "id",
    "user_id",
    'custom'::"NotificationType",
    'Legacy notification',
    COALESCE("template_code", 'legacy_notification'),
    "created_at"
FROM "notification_deliveries";

UPDATE "notification_deliveries" AS deliveries
SET "notification_id" = notifications."id"
FROM "notifications" AS notifications
WHERE notifications."id" = 'legacy-' || deliveries."id";

ALTER TABLE "notification_deliveries"
ALTER COLUMN "notification_id" SET NOT NULL;

-- DropIndex
DROP INDEX "notification_deliveries_user_id_idx";

-- AlterTable
ALTER TABLE "notification_deliveries"
DROP COLUMN "template_code",
DROP COLUMN "user_id";

-- CreateIndex
CREATE UNIQUE INDEX "notifications_event_key_key" ON "notifications"("event_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_read_at_idx" ON "notifications"("read_at");

-- CreateIndex
CREATE INDEX "notification_deliveries_notification_id_idx" ON "notification_deliveries"("notification_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
