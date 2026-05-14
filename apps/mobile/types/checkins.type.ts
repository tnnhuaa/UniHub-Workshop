export type SyncStatus = 'pending' | 'synced' | 'error' | 'rejected';

export interface Student {
    mssv: string;
    fullName: string | null;
    email: string | null;
    faculty: string | null;
    phone?: string | null;
    className?: string | null;
}

export interface Registration {
    id: string;
    registrationStatus: 'pending' | 'confirmed' | 'cancelled' | 'expired';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    checkedInAt: string | null;
    syncedAt: string | null;
    syncStatus: SyncStatus;
    student: Student;
    checkinStaff?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
}

export interface WorkshopResponse {
    workshopId: string;
    title: string;
    description: string | null;
    status: string;
    registrations: Registration[];
}

export interface PublishedWorkshop {
    id: string;
    title: string;
    description: string | null;
    status: string;
    isActive: number;
}

export interface WorkshopRegistrationWithStatus {
    registrationId: string;
    workshopId: string;
    mssv: string;
    fullName: string | null;
    email: string | null;
    faculty: string | null;
    className: string | null;
    registrationStatus: Registration['registrationStatus'];
    paymentStatus: Registration['paymentStatus'];
    checkedInAt: string | null;
    syncStatus: SyncStatus | null;
    isCheckedIn: boolean;
    checkinId: string | null;
}

export interface CheckinRecord {
    id?: string; // Server ID
    deviceEventId: string; // Client UUID
    mssv: string;
    workshopId: string;
    registrationId?: string | null;
    qrCode?: string | null;
    scannedAt: string;
    syncStatus: SyncStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
}

// API Response Types
export interface SyncResponse {
    deviceId: string;
    results: {
        deviceEventId: string;
        status: 'accepted' | 'duplicate' | 'rejected';
        checkinId: string;
        reason?: string;
    }[];
}