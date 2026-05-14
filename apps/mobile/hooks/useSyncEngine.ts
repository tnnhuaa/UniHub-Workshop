import { useCallback, useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getPendingCheckins, updateCheckinStatus } from "../db/checkinRepository";
import { syncBatchCheckins, type ApiError } from "../services/apiService";
import type { CheckinRecord, SyncResponse } from "../types/checkins.type";

type UseSyncEngineResult = {
    isOnline: boolean;
    isSyncing: boolean;
    lastError: ApiError | null;
    triggerSync: () => Promise<void>;
};

const isSyncResponse = (data: unknown): data is SyncResponse => {
    if (!data || typeof data !== "object") {
        return false;
    }

    const payload = data as SyncResponse;
    return (
        typeof payload.deviceId === "string" &&
        Array.isArray(payload.results)
    );
};

const mapToSyncRecord = (record: CheckinRecord) => ({
    deviceEventId: record.deviceEventId,
    mssv: record.mssv,
    workshopId: record.workshopId,
    scannedAt: record.scannedAt,
});

export const useSyncEngine = (deviceId: string): UseSyncEngineResult => {
    const [isOnline, setIsOnline] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastError, setLastError] = useState<ApiError | null>(null);
    const prevOnlineRef = useRef<boolean>(false);

    const applySyncResults = useCallback((response: SyncResponse) => {
        response.results.forEach((result) => {
            if (result.status === "accepted" || result.status === "duplicate") {
                updateCheckinStatus({
                    deviceEventId: result.deviceEventId,
                    syncStatus: "synced",
                    errorCode: null,
                    errorMessage: null,
                    serverCheckinId: result.checkinId ?? null,
                });
                return;
            }

            updateCheckinStatus({
                deviceEventId: result.deviceEventId,
                syncStatus: "error",
                errorCode: result.reason ?? "REJECTED",
                errorMessage: result.reason ?? "Rejected by server",
                serverCheckinId: null,
            });
        });
    }, []);

    const triggerSync = useCallback(async () => {
        if (isSyncing) {
            return;
        }

        const pending = getPendingCheckins();
        if (pending.length === 0) {
            setLastError(null);
            return;
        }

        setIsSyncing(true);

        try {
            const response = await syncBatchCheckins({
                deviceId,
                records: pending.map(mapToSyncRecord),
            });

            if (!response.ok) {
                setLastError(response.error);
                return;
            }

            if (isSyncResponse(response.data)) {
                applySyncResults(response.data);
                setLastError(null);
                return;
            }

            setLastError({
                status: null,
                message: "Unexpected sync response",
            });
        } finally {
            setIsSyncing(false);
        }
    }, [applySyncResults, deviceId, isSyncing]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const reachable = state.isInternetReachable ?? true;
            const online = Boolean(state.isConnected && reachable);

            setIsOnline(online);

            const wasOnline = prevOnlineRef.current;
            prevOnlineRef.current = online;

            if (!wasOnline && online) {
                void triggerSync();
            }
        });

        return () => unsubscribe();
    }, [triggerSync]);

    return {
        isOnline,
        isSyncing,
        lastError,
        triggerSync,
    };
};
