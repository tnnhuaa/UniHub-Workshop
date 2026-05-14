import axios, { AxiosError } from "axios";
import api from "./api";
import type { WorkshopResponse } from "../types/checkins.type";

export type ApiError = {
    status: number | null;
    code?: string;
    message: string;
};

type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: ApiError };

type CheckinScanBody = {
    deviceId: string;
    deviceEventId: string;
    scannedAt?: string;
    qrCode: string;
};

type CheckinConfirmBody = {
    deviceId: string;
    deviceEventId: string;
    scannedAt?: string;
    registrationId: string;
};

type SyncRecord = {
    deviceEventId: string;
    mssv: string;
    workshopId: string;
    scannedAt?: string;
};

type SyncBatchBody = {
    deviceId: string;
    records: SyncRecord[];
};


const parseApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ code?: string; message?: string }>;
        const status = axiosError.response?.status ?? null;
        const code = axiosError.response?.data?.code;
        const message =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Unknown error";

        return { status, code, message };
    }

    if (error instanceof Error) {
        return { status: null, message: error.message };
    }

    return { status: null, message: "Unknown error" };
};

export const postCheckinScan = async (
    body: CheckinScanBody
): Promise<ApiResult<unknown>> => {
    try {
        const response = await api.post("/checkins/scan", body);
        return { ok: true, data: response.data };
    } catch (error) {
        return { ok: false, error: parseApiError(error) };
    }
};

export const postCheckinConfirm = async (
    body: CheckinConfirmBody
): Promise<ApiResult<unknown>> => {
    try {
        const response = await api.post("/checkins/confirm", body);
        return { ok: true, data: response.data };
    } catch (error) {
        return { ok: false, error: parseApiError(error) };
    }
};

export const syncBatchCheckins = async (
    body: SyncBatchBody
): Promise<ApiResult<unknown>> => {
    try {
        const response = await api.post("/checkins/sync", body);
        return { ok: true, data: response.data };
    } catch (error) {
        return { ok: false, error: parseApiError(error) };
    }
};

export const getWorkshopRegistrations = async (
    workshopId: string
): Promise<ApiResult<WorkshopResponse>> => {
    try {
        const response = await api.get(`/checkins/workshop/${workshopId}`);
        return { ok: true, data: response.data as WorkshopResponse };
    } catch (error) {
        return { ok: false, error: parseApiError(error) };
    }
};
