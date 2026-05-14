import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { getWorkshopRegistrations } from "../services/apiService";
import { syncWorkshopData } from "../db/checkinRepository";

type ParsedWorkshop = {
    id: string;
    name?: string | null;
    description?: string | null;
};

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseWorkshopPayload = (payload: string): ParsedWorkshop | null => {
    if (!payload) {
        return null;
    }

    try {
        const parsed = JSON.parse(payload) as {
            workshopId?: string;
            id?: string;
            name?: string;
            description?: string;
        };
        const id = parsed.workshopId ?? parsed.id;
        if (typeof id === "string" && UUID_REGEX.test(id)) {
            return {
                id,
                name: parsed.name ?? null,
                description: parsed.description ?? null,
            };
        }
    } catch {
        // ignore JSON parse errors
    }

    try {
        const url = new URL(payload);
        const id = url.searchParams.get("workshopId") ?? url.searchParams.get("id");
        if (id && UUID_REGEX.test(id)) {
            return { id, name: null, description: null };
        }
    } catch {
        // ignore URL parse errors
    }

    if (UUID_REGEX.test(payload)) {
        return { id: payload, name: null, description: null };
    }

    return null;
};

export default function SyncWorkshopScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [hasScanned, setHasScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!permission) {
            void requestPermission();
        }
    }, [permission, requestPermission]);

    const headerText = useMemo(() => {
        if (permission?.status === "denied") {
            return "Camera permission denied";
        }
        return "Scan Workshop QR Code";
    }, [permission?.status]);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (hasScanned || isLoading) {
            return;
        }

        setHasScanned(true);

        const parsedWorkshop = parseWorkshopPayload(data);
        if (!parsedWorkshop) {
            Alert.alert("QR Code Invalid", "No Workshop Id found.", [
                {
                    text: "Try Again",
                    onPress: () => setHasScanned(false),
                },
            ]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await getWorkshopRegistrations(parsedWorkshop.id);
            if (!response.ok) {
                Alert.alert("Failed to fetch data", response.error.message);
                setHasScanned(false);
                return;
            }

            const savedCount = await syncWorkshopData(response.data);

            Alert.alert(
                "Data synced successfully",
                `Da tai workshop ${response.data.title} voi ${savedCount} sinh vien dang ky.`
            );
            router.replace("/");
        } catch (error) {
            Alert.alert("Sync Error", "Failed to sync workshop data.");
            console.error("Sync error:", error);
            setHasScanned(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={styles.statusText}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.statusText}>No camera permission.</Text>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => requestPermission()}
                >
                    <Text style={styles.actionText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{headerText}</Text>
                <Text style={styles.headerSubtitle}>
                    Place the QR code within the frame to fetch the student list.
                </Text>
            </View>

            <View style={styles.scannerWrap}>
                {!hasScanned ? (
                    <CameraView
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                        style={StyleSheet.absoluteFillObject}
                    />
                ) : (
                    <View style={styles.cameraBlocked} />
                )}
                <View style={styles.scanFrame} />
                {hasScanned || isLoading ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loadingText}>
                            {isLoading ? "Loading data..." : "Processing QR code..."}
                        </Text>
                    </View>
                ) : null}
            </View>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setHasScanned(false)}
            >
                <Text style={styles.actionText}>Scan Again</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 20,
    },
    header: {
        marginTop: 16,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#f8fafc",
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#cbd5f5",
    },
    scannerWrap: {
        flex: 1,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1e3a8a",
        backgroundColor: "#111827",
        justifyContent: "center",
        alignItems: "center",
    },
    cameraBlocked: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#111827",
    },
    scanFrame: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(15, 23, 42, 0.2)",
    },
    actionButton: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#1d4ed8",
        alignItems: "center",
    },
    actionText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 15,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: 24,
    },
    statusText: {
        marginTop: 12,
        color: "#e2e8f0",
        fontSize: 14,
        textAlign: "center",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#ffffff",
        fontSize: 14,
    },
});
