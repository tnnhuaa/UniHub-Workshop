import { z } from 'zod/v4';

export const checkinWorkshopParamSchema = z.object({
  id: z.string().uuid(),
});

const baseDeviceSchema = z.object({
  deviceId: z.string().trim().min(1),
  deviceEventId: z.string().uuid(),
  scannedAt: z.coerce.date().optional(),
});

export const checkinScanSchema = baseDeviceSchema.extend({
  qrCode: z.string().trim().min(1),
});

export const checkinConfirmSchema = baseDeviceSchema.extend({
  registrationId: z.string().uuid(),
});

export const checkinSyncRecordSchema = z.object({
  deviceEventId: z.string().uuid(),
  mssv: z.string().trim().min(1),
  workshopId: z.string().uuid(),
  scannedAt: z.coerce.date().optional(),
});

export const checkinSyncSchema = z.object({
  deviceId: z.string().trim().min(1),
  records: z.array(checkinSyncRecordSchema).min(1).max(200),
});

export type CheckinWorkshopParam = z.infer<typeof checkinWorkshopParamSchema>;
export type CheckinScanInput = z.infer<typeof checkinScanSchema>;
export type CheckinConfirmInput = z.infer<typeof checkinConfirmSchema>;
export type CheckinSyncInput = z.infer<typeof checkinSyncSchema>;
