import { db } from "./client";
import type {
    CheckinRecord,
    PublishedWorkshop,
    Registration,
    Student,
    SyncStatus,
    WorkshopRegistrationWithStatus,
    WorkshopResponse,
} from "../types/checkins.type";

export type LocalRegistration = {
    id: string;
    workshopId: string | null;
    registrationStatus: Registration["registrationStatus"];
    paymentStatus: Registration["paymentStatus"];
    serverCheckedInAt: string | null;
    student: Student & {
        className: string | null;
        phone: string | null;
    };
};

export type LocalWorkshop = PublishedWorkshop;

export type RegistrationInsert = {
    id: string;
    workshopId: string;
    mssv: string;
    fullName: string | null;
    email: string | null;
    faculty: string | null;
    className: string | null;
    registrationStatus: Registration["registrationStatus"];
    paymentStatus: Registration["paymentStatus"];
    serverCheckedInAt: string | null;
};

type RegistrationLookupRow = {
    id: string;
    workshopId: string | null;
    registrationStatus: Registration["registrationStatus"];
    paymentStatus: Registration["paymentStatus"];
    serverCheckedInAt: string | null;
    mssv: string;
    fullName: string | null;
    email: string | null;
    faculty: string | null;
    className: string | null;
};

type PendingCheckinInput = Omit<
    CheckinRecord,
    "syncStatus" | "errorCode" | "errorMessage" | "id"
>;

const isMissingTableError = (error: unknown) => {
    if (error instanceof Error) {
        return error.message.includes("no such table");
    }

    return false;
};

export const savePendingCheckin = (input: PendingCheckinInput) => {
    db.runSync(
        `
      INSERT INTO checkins (
        device_event_id,
        workshop_id,
        mssv,
        registration_id,
        qr_code,
        scanned_at,
        sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending');
    `,
        [
            input.deviceEventId,
            input.workshopId,
            input.mssv,
            input.registrationId ?? null,
            input.qrCode ?? null,
            input.scannedAt,
        ]
    );
};

export const getPendingCheckins = (): CheckinRecord[] => {
    try {
        const rows = db.getAllSync<CheckinRecord>(
            `
            SELECT
                server_checkin_id AS id,
                device_event_id AS deviceEventId,
                mssv,
                workshop_id AS workshopId,
                registration_id AS registrationId,
                qr_code AS qrCode,
                scanned_at AS scannedAt,
                sync_status AS syncStatus,
                error_code AS errorCode,
                error_message AS errorMessage
            FROM checkins
            WHERE sync_status = 'pending'
            ORDER BY scanned_at ASC;
        `
        );

        return rows;
    } catch (error) {
        if (isMissingTableError(error)) {
            return [];
        }

        throw error;
    }
};

export const updateCheckinStatus = (params: {
    deviceEventId: string;
    syncStatus: Exclude<SyncStatus, "pending">;
    errorCode?: string | null;
    errorMessage?: string | null;
    serverCheckinId?: string | null;
}) => {
    db.runSync(
        `
      UPDATE checkins
      SET
        sync_status = ?,
        error_code = ?,
        error_message = ?,
        server_checkin_id = ?
      WHERE device_event_id = ?;
    `,
        [
            params.syncStatus,
            params.errorCode ?? null,
            params.errorMessage ?? null,
            params.serverCheckinId ?? null,
            params.deviceEventId,
        ]
    );
};

export const findRegistrationByMSSV = (mssv: string): LocalRegistration | null => {
    try {
        const rows = db.getAllSync<RegistrationLookupRow>(
            `
      SELECT
        id,
        workshop_id AS workshopId,
        registration_status AS registrationStatus,
        payment_status AS paymentStatus,
        server_checked_in_at AS serverCheckedInAt,
        mssv,
        full_name AS fullName,
        email,
        faculty,
        class_name AS className
      FROM registrations
      WHERE mssv = ?
      LIMIT 1;
    `,
            [mssv]
        );

        const row = rows[0];
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            workshopId: row.workshopId,
            registrationStatus: row.registrationStatus,
            paymentStatus: row.paymentStatus,
            serverCheckedInAt: row.serverCheckedInAt,
            student: {
                mssv: row.mssv,
                fullName: row.fullName,
                email: row.email,
                faculty: row.faculty,
                phone: null,
                className: row.className,
            },
        };
    } catch (error) {
        if (isMissingTableError(error)) {
            return null;
        }

        throw error;
    }
};

export const findRegistrationByMSSVAndWorkshop = (
    mssv: string,
    workshopId: string
): LocalRegistration | null => {
    try {
        const rows = db.getAllSync<RegistrationLookupRow>(
            `
      SELECT
        id,
        workshop_id AS workshopId,
        registration_status AS registrationStatus,
        payment_status AS paymentStatus,
        server_checked_in_at AS serverCheckedInAt,
        mssv,
        full_name AS fullName,
        email,
        faculty,
        class_name AS className
      FROM registrations
      WHERE mssv = ? AND workshop_id = ?
      LIMIT 1;
    `,
            [mssv, workshopId]
        );

        const row = rows[0];
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            workshopId: row.workshopId,
            registrationStatus: row.registrationStatus,
            paymentStatus: row.paymentStatus,
            serverCheckedInAt: row.serverCheckedInAt,
            student: {
                mssv: row.mssv,
                fullName: row.fullName,
                email: row.email,
                faculty: row.faculty,
                phone: null,
                className: row.className,
            },
        };
    } catch (error) {
        if (isMissingTableError(error)) {
            return null;
        }

        throw error;
    }
};

export const getPublishedWorkshops = (): LocalWorkshop[] => {
    try {
        return db.getAllSync<LocalWorkshop>(
            `
      SELECT
        id,
        name AS title,
        description,
        status,
        is_active AS isActive
      FROM workshops
      WHERE status = 'published'
      ORDER BY name ASC;
    `
        );
    } catch (error) {
        if (isMissingTableError(error)) {
            return [];
        }

        throw error;
    }
};

export const getActiveWorkshop = (): LocalWorkshop | null => {
    try {
        const rows = db.getAllSync<LocalWorkshop>(
            `
      SELECT
      id,
      name AS title,
      description,
      status,
      is_active AS isActive
      FROM workshops
      WHERE is_active = 1
      LIMIT 1;
    `
        );

        return rows[0] ?? null;
    } catch (error) {
        if (isMissingTableError(error)) {
            return null;
        }

        throw error;
    }
};

export const replaceWorkshopRegistrations = (params: {
    workshop: { id: string; name?: string | null; description?: string | null };
    registrations: RegistrationInsert[];
}) => {
    db.execSync("BEGIN TRANSACTION;");

    try {
        db.runSync("UPDATE workshops SET is_active = 0;");
        db.runSync("DELETE FROM registrations;");

        db.runSync(
            `
      INSERT OR REPLACE INTO workshops (id, name, description, status, is_active)
      VALUES (?, ?, ?, ?, 1);
      `,
            [params.workshop.id, params.workshop.name ?? null, params.workshop.description ?? null, null]
        );

        params.registrations.forEach((registration) => {
            db.runSync(
                `
        INSERT OR REPLACE INTO registrations (
        id,
        workshop_id,
        mssv,
        full_name,
        email,
        faculty,
        class_name,
        registration_status,
        payment_status,
        server_checked_in_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
                [
                    registration.id,
                    registration.workshopId,
                    registration.mssv,
                    registration.fullName,
                    registration.email,
                    registration.faculty,
                    registration.className,
                    registration.registrationStatus,
                    registration.paymentStatus,
                    registration.serverCheckedInAt,
                ]
            );
        });

        db.execSync("COMMIT;");
    } catch (error) {
        db.execSync("ROLLBACK;");
        throw error;
    }
};

export const syncWorkshopData = async (data: WorkshopResponse): Promise<number> => {
    const registrationCount = data.registrations.length;

    await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.execAsync("UPDATE workshops SET is_active = 0;");
        await tx.runAsync(
            `
        INSERT OR REPLACE INTO workshops (id, name, description, status, is_active)
        VALUES (?, ?, ?, ?, 1);
      `,
            data.workshopId,
            data.title,
            data.description,
            data.status
        );

        await tx.runAsync("DELETE FROM registrations WHERE workshop_id = ?;", data.workshopId);

        for (const registration of data.registrations) {
            await tx.runAsync(
                `
          INSERT OR REPLACE INTO registrations (
            id,
            workshop_id,
            mssv,
            full_name,
            email,
            faculty,
            class_name,
            registration_status,
            payment_status,
            server_checked_in_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
                registration.id,
                data.workshopId,
                registration.student.mssv,
                registration.student.fullName,
                registration.student.email,
                registration.student.faculty,
                registration.student.className ?? null,
                registration.registrationStatus,
                registration.paymentStatus,
                registration.checkedInAt
            );
        }
    });

    return registrationCount;
};

export const getRegistrationsWithStatus = (
    workshopId: string
): WorkshopRegistrationWithStatus[] => {
    try {
        return db.getAllSync<WorkshopRegistrationWithStatus>(
            `
      SELECT
        r.id AS registrationId,
        r.workshop_id AS workshopId,
        r.mssv,
        r.full_name AS fullName,
        r.email,
        r.faculty,
        r.class_name AS className,
        r.registration_status AS registrationStatus,
        r.payment_status AS paymentStatus,
        r.server_checked_in_at AS checkedInAt,
        CASE WHEN c.device_event_id IS NOT NULL THEN 1 ELSE 0 END AS isCheckedIn,
        c.device_event_id AS checkinId,
        c.sync_status AS syncStatus
      FROM registrations r
      LEFT JOIN checkins c
        ON c.device_event_id = (
          SELECT c2.device_event_id
          FROM checkins c2
          WHERE c2.workshop_id = r.workshop_id
            AND (
              c2.registration_id = r.id
              OR (c2.registration_id IS NULL AND c2.mssv = r.mssv)
            )
          ORDER BY c2.scanned_at DESC
          LIMIT 1
        )
      WHERE r.workshop_id = ?
      ORDER BY r.full_name ASC;
    `,
            [workshopId]
        );
    } catch (error) {
        if (isMissingTableError(error)) {
            return [];
        }

        throw error;
    }
};

export const updateRegistrationsCheckinStatus = (
    workshopId: string,
    registrationsFromApi: Registration[]
) => {
    db.withTransactionSync(() => {
        for (const reg of registrationsFromApi) {
            // Cập nhật thời gian check-in từ server cho từng sinh viên
            db.runSync(
                `UPDATE registrations 
                 SET server_checked_in_at = ?, registration_status = ?
                 WHERE mssv = ? AND workshop_id = ?`,
                [reg.checkedInAt, reg.registrationStatus, reg.student.mssv, workshopId]
            );

            if (reg.checkedInAt) {
                db.runSync(
                    `UPDATE checkins 
                     SET sync_status = 'synced' 
                     WHERE mssv = ? AND workshop_id = ? AND sync_status = 'pending'`,
                    [reg.student.mssv, workshopId]
                );
            }
        }
    });
};
