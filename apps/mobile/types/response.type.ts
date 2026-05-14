export type SyncStatus = 'pending' | 'synced' | 'rejected';
export type CheckinResponseStatus = 'created' | 'duplicate';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StudentInfo {
  mssv: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  faculty: string | null;
  className: string | null;
}

export interface RegistrationInfo {
  id: string; // uuid
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
}

export interface StaffInfo {
  id: string; // uuid
  name: string | null;
  email: string;
}

export interface Checkin {
  id: string; // uuid
  mssv: string;
  workshopId: string; // uuid
  checkinStaffId: string | null; // uuid
  registrationId: string | null; // uuid
  deviceEventId: string | null; // uuid
  checkedInAt: string; // ISODateTime string
  syncedAt: string | null; // ISODateTime string
  syncStatus: SyncStatus;
  createdAt: string; // ISODateTime string
  student: StudentInfo;
  registration: RegistrationInfo | null;
  checkinStaff: StaffInfo | null;
}

export interface CheckinResponse {
  status: CheckinResponseStatus;
  checkin: Checkin;
}
