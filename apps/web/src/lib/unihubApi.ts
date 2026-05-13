import { getJson, postJson, withIdempotencyKey } from "./apiClient.ts";

export type WorkshopStatus = "draft" | "published" | "cancelled" | "completed";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type WorkshopApiDto = {
  id: string;
  title: string;
  description?: string | null;
  speaker?: string | null;
  room?: string | null;
  capacity: number;
  registeredCount: number;
  price: string | number;
  startTime: string;
  endTime: string;
  status: WorkshopStatus;
  floorMapUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentApiDto = {
  mssv: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  faculty?: string | null;
  className?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  csvSyncedAt?: string | null;
};

export type RegistrationApiDto = {
  id: string;
  mssv: string;
  workshopId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  qrCode?: string | null;
  registeredAt?: string;
  paymentCompletedAt?: string | null;
  heldUntil?: string | null;
  cancellationReason?: string | null;
  createdAt?: string;
};

export type PaymentApiDto = {
  id: string;
  provider: string;
  providerRef?: string | null;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  requestedAt?: string;
  completedAt?: string | null;
};

export type RegistrationCheckoutResponseDto = {
  registration: RegistrationApiDto;
  paymentRequired: boolean;
  payment?: {
    paymentId?: string;
    mockActions?: {
      successEndpoint: string;
      failureEndpoint: string;
    };
  } | null;
};

export type RegistrationQrDto = {
  qrCode: string;
};

export type WorkshopListQuery = {
  q?: string;
  status?: WorkshopStatus;
  startFrom?: string;
  startTo?: string;
  page?: number;
  pageSize?: number;
};

export type RegistrationListQuery = {
  status?: RegistrationStatus;
  page?: number;
  pageSize?: number;
};

export const fetchWorkshops = (query: WorkshopListQuery) =>
  getJson<WorkshopApiDto[]>("/workshops", { query });

export const fetchWorkshop = (id: string) => getJson<WorkshopApiDto>(`/workshops/${id}`);

export const fetchCurrentStudent = () => getJson<StudentApiDto>("/students/me");

export const fetchStudent = (mssv: string) => getJson<StudentApiDto>(`/students/${mssv}`);

export const fetchMyRegistrations = (query: RegistrationListQuery) =>
  getJson<RegistrationApiDto[]>("/registrations/me", { query });

export const fetchRegistrationQr = (id: string) =>
  getJson<RegistrationQrDto>(`/registrations/${id}/qr`);

export const createRegistration = (
  body: { mssv: string; workshopId: string },
  idempotencyKey: string,
) =>
  postJson<RegistrationCheckoutResponseDto, { mssv: string; workshopId: string }>(
    "/registrations",
    {
      body,
      headers: withIdempotencyKey(idempotencyKey),
    },
  );