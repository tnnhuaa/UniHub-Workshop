import { getJson, patchJson, postJson, withIdempotencyKey } from './apiClient.ts';

export type WorkshopStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type WorkshopDocumentApiDto = {
  id: string;
  workshopId: string;
  fileUrl: string;
  fileName: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
};

export type DocumentSummaryApiDto = {
  documentId: string;
  status: JobStatus;
  summaryText: string | null;
  retryCount: number;
  updatedAt: string | null;
};

export type AdminCsvSyncBatchDto = {
  id: string;
  sourceFile: string;
  status: JobStatus;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  conflictRecords: number;
  startedAt: string;
  completedAt: string | null;
  lastError: {
    rowNumber: number;
    message: string;
  } | null;
};

export type AdminAiSummaryCountsDto = {
  pending: number;
  running: number;
  completed: number;
  failed: number;
};

export type AdminDashboardResponseDto = {
  kpis: {
    totalWorkshops: number;
    totalRegistrations: number;
    grossRevenue: number;
  };
  workshops: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    capacity: number;
    registeredCount: number;
    status: WorkshopStatus;
  }>;
  systemHealth: {
    csvSync: {
      batches: AdminCsvSyncBatchDto[];
    };
    aiSummary: {
      counts: AdminAiSummaryCountsDto;
      lastCompletedAt: string | null;
    };
  };
};

export type AdminDashboardQuery = {
  q?: string;
};

export type WorkshopCreateInput = {
  title: string;
  description?: string;
  speaker?: string;
  room?: string;
  capacity: number;
  price?: number;
  startTime: string;
  endTime: string;
  floorMapUrl?: string;
  status?: WorkshopStatus;
};

export type WorkshopUpdateInput = Partial<WorkshopCreateInput>;

export const fetchWorkshops = (query: WorkshopListQuery) =>
  getJson<WorkshopApiDto[]>('/workshops', { query });

export const fetchWorkshop = (id: string) =>
  getJson<WorkshopApiDto>(`/workshops/${id}`);

export const fetchCurrentStudent = () => getJson<StudentApiDto>('/students/me');

export const fetchStudent = (mssv: string) =>
  getJson<StudentApiDto>(`/students/${mssv}`);

export const fetchMyRegistrations = (query: RegistrationListQuery) =>
  getJson<RegistrationApiDto[]>('/registrations/me', { query });

export const fetchRegistrationQr = (id: string) =>
  getJson<RegistrationQrDto>(`/registrations/${id}/qr`);

export const createRegistration = (
  body: { mssv: string; workshopId: string },
  idempotencyKey: string,
) =>
  postJson<
    RegistrationCheckoutResponseDto,
    { mssv: string; workshopId: string }
  >('/registrations', {
    body,
    headers: withIdempotencyKey(idempotencyKey),
  });

export const fetchAdminDashboard = (query?: AdminDashboardQuery) =>
  getJson<AdminDashboardResponseDto>('/admin/dashboard', { query });

export const fetchWorkshopDocuments = (workshopId: string) =>
  getJson<WorkshopDocumentApiDto[]>(`/admin/workshops/${workshopId}/documents`);

export const uploadWorkshopDocument = (
  workshopId: string,
  body: {
    fileName: string;
    contentBase64: string;
    contentType?: string;
  },
) =>
  postJson<
    {
      document: WorkshopDocumentApiDto;
      summaryJob: {
        id: string;
        documentId: string;
        status: JobStatus;
        summaryText?: string | null;
        retryCount: number;
      };
    },
    typeof body
  >(`/admin/workshops/${workshopId}/documents`, {
    body,
  });

export const createWorkshop = (body: WorkshopCreateInput) =>
  postJson<WorkshopApiDto, WorkshopCreateInput>('/admin/workshops', {
    body,
  });

export const updateWorkshop = (workshopId: string, body: WorkshopUpdateInput) =>
  patchJson<WorkshopApiDto, WorkshopUpdateInput>(`/admin/workshops/${workshopId}`, {
    body,
  });

export const fetchDocumentSummary = (workshopId: string, documentId: string) =>
  getJson<DocumentSummaryApiDto>(
    `/admin/workshops/${workshopId}/documents/${documentId}/summary`,
  );
