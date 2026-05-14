import { useEffect, useState } from 'react';
import NetInfo from "@react-native-community/netinfo";
import { getWorkshopRegistrations } from "../services/apiService";
import { updateRegistrationsCheckinStatus } from "../db/checkinRepository";

export function useAutoSyncDown(workshopId: string, onSyncComplete: () => void) {
    const [isSyncing, setIsSyncing] = useState(false);

    const performSync = async () => {
        const state = await NetInfo.fetch();
        if (!state.isConnected || isSyncing) return;

        setIsSyncing(true);
        try {
            const response = await getWorkshopRegistrations(workshopId);
            if (response.ok && response.data.registrations) {
                updateRegistrationsCheckinStatus(workshopId, response.data.registrations);
                onSyncComplete();
                console.log("Auto sync-down completed");
            }
        } catch (error) {
            console.error("Auto sync-down failed", error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        performSync();

        const interval = setInterval(performSync, 120000);

        return () => clearInterval(interval);
    }, [workshopId]);

    return { isSyncing };
}