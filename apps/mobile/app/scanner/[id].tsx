import 'react-native-get-random-values';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import NetInfo from "@react-native-community/netinfo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { v4 as uuidv4 } from "uuid";
import {
    savePendingCheckin,
    updateCheckinStatus,
    findRegistrationByMSSVAndWorkshop,
} from "../../db/checkinRepository";
import { postCheckinScan, postCheckinConfirm } from "../../services/apiService";
import * as Application from 'expo-application';
import { useBehavior } from '@/hooks/useBehavior';
import { CheckinResponse } from '@/types/response.type';

interface FeedbackState {
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
}

export default function ScannerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const workshopId = useMemo(
        () => (Array.isArray(params.id) ? params.id[0] : params.id),
        [params.id]
    );
    const behaviour = useBehavior();

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const feedbackAnimValue = useRef(new Animated.Value(0)).current;
    const [deviceId, setDeviceId] = useState<string>("");

    // State management
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>({ show: false, type: "info", message: "" });
    const [manualMSSV, setManualMSSV] = useState("");
    const [isOnline, setIsOnline] = useState(true);
    const [scannedCount, setScannedCount] = useState(0);


    // Request camera permission
    useEffect(() => {
        const requestPerms = async () => {
            if (!permission?.granted) {
                await requestPermission();
            }
        };
        requestPerms();
    }, [permission, requestPermission]);

    // Monitor network status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOnline(state.isConnected ?? false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function getDevice() {
            const id = Platform.OS === 'android'
                ? Application.getAndroidId()
                : await Application.getIosIdForVendorAsync();
            console.log("Device ID:", id);
            setDeviceId(id || "unknown-device");
        }
        getDevice();
    }, []);

    // Show feedback with animation
    const showFeedback = useCallback((type: "success" | "error" | "info", message: string) => {
        setFeedback({ show: true, type, message });

        Animated.sequence([
            Animated.timing(feedbackAnimValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(feedbackAnimValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setFeedback({ show: false, type: "info", message: "" });
        });
    }, [feedbackAnimValue]);

    // Haptic feedback
    const triggerHaptic = useCallback(async (type: "success" | "error") => {
        try {
            if (type === "success") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } catch (err) {
            console.error("Haptic feedback error:", err);
        }
    }, []);

    // Main check-in logic
    const performCheckin = useCallback(
        async (qrCode?: string, mssv?: string) => {
            if (isProcessing || !workshopId) return;

            setIsProcessing(true);
            try {
                const deviceEventId = uuidv4();
                const scannedAt = new Date().toISOString();

                let registrationId: string | null = null;

                // If using manual MSSV, lookup registration first
                if (mssv) {
                    const registration = findRegistrationByMSSVAndWorkshop(mssv, workshopId);
                    if (registration) {
                        registrationId = registration.id;
                    }
                }

                // STEP 1: Durable Write - Save to SQLite with 'pending' status
                try {
                    savePendingCheckin({
                        deviceEventId,
                        workshopId,
                        mssv: mssv || "unknown",
                        registrationId: registrationId || undefined,
                        qrCode: qrCode || undefined,
                        scannedAt,
                    });
                } catch (dbError) {
                    console.error("Database error:", dbError);
                    await triggerHaptic("error");
                    showFeedback("error", "Error saving check-in locally");
                    setIsProcessing(false);
                    return;
                }

                // STEP 2: Check Network
                if (!isOnline) {
                    await triggerHaptic("success");
                    showFeedback("info", mssv ? "✓ Student ID saved offline" : "✓ QR saved offline");
                    setScannedCount((prev) => prev + 1);

                    // Reset manual input if used
                    if (mssv) {
                        setManualMSSV("");
                        Keyboard.dismiss();
                    }

                    setIsProcessing(false);
                    return;
                }

                // STEP 3: Online - Push to API
                let apiResult;

                if (qrCode) {
                    // QR Code: Use /checkins/scan endpoint
                    console.log({
                        deviceId: deviceId,
                        deviceEventId,
                        scannedAt,
                        qrCode,
                    });
                    apiResult = await postCheckinScan({
                        deviceId: deviceId,
                        deviceEventId,
                        scannedAt,
                        qrCode,
                    });
                } else if (mssv && registrationId) {
                    // Manual MSSV with found registration: Use /checkins/confirm
                    console.log({
                        deviceId: deviceId,
                        deviceEventId,
                        scannedAt,
                        registrationId,
                    });
                    apiResult = await postCheckinConfirm({
                        deviceId: deviceId,
                        deviceEventId,
                        scannedAt,
                        registrationId,
                    });
                } else {
                    // Manual MSSV not found: Still save locally but mark as unverified
                    await triggerHaptic("error");
                    showFeedback(
                        "error",
                        `Student ID ${mssv} not found for this workshop.`
                    );
                    setScannedCount((prev) => prev + 1);
                    if (mssv) {
                        setManualMSSV("");
                        Keyboard.dismiss();
                    }
                    setIsProcessing(false);
                    return;
                }

                // Handle API Response
                if (apiResult.ok) {
                    // Success: Update local record to 'synced'
                    updateCheckinStatus({
                        deviceEventId,
                        syncStatus: "synced",
                        serverCheckinId: (apiResult.data as CheckinResponse)?.checkin?.id || undefined,
                    });

                    if ((apiResult.data as CheckinResponse)?.status === "duplicate") {
                        await triggerHaptic("error");
                        showFeedback("error", "Student has already checked in");
                        return;
                    }

                    await triggerHaptic("success");
                    console.log("Check-in successful:", apiResult.data);
                    showFeedback("success", mssv ? "✓ Check-in by Student ID successfully" : "✓ Check-in by QR code successfully");
                    setScannedCount((prev) => prev + 1);
                } else {
                    // Error: Update local record to 'error' with error details
                    updateCheckinStatus({
                        deviceEventId,
                        syncStatus: "error",
                        errorCode: apiResult.error.code,
                        errorMessage: apiResult.error.message,
                    });

                    await triggerHaptic("error");
                    let errorMsg = "Error from server";
                    if (apiResult.error.code === "duplicate") {
                        errorMsg = "Student has already checked in";
                    } else if (apiResult.error.code === "not_found") {
                        errorMsg = mssv ? `Student ID ${mssv} is invalid` : "QR is invalid";
                    }

                    showFeedback("error", errorMsg);
                    console.error("API error:", apiResult.error);
                }

                // Reset manual input
                if (mssv) {
                    setManualMSSV("");
                    Keyboard.dismiss();
                }
            } catch (error) {
                console.error("Check-in error:", error);
                await triggerHaptic("error");
                showFeedback("error", "Error processing check-in");
            } finally {
                setIsProcessing(false);
            }
        },
        [workshopId, isProcessing, isOnline, triggerHaptic, showFeedback, deviceId]
    );

    // Handle QR code scan
    const handleBarCodeScanned = useCallback(
        (result: BarcodeScanningResult) => {
            if (isProcessing) return;

            try {
                const qrCode = result.data;
                performCheckin(qrCode, undefined);
            } catch (err) {
                console.error("QR parsing error:", err);
            }
        },
        [isProcessing, performCheckin]
    );

    // Handle manual MSSV submission
    const handleConfirmMSSV = useCallback(() => {
        if (!manualMSSV.trim()) {
            Alert.alert("Error", "Please enter the student ID");
            return;
        }
        performCheckin(undefined, manualMSSV.trim());
    }, [manualMSSV, performCheckin]);

    if (!permission?.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Need camera access permission</Text>
                <Pressable style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    if (!workshopId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Invalid Workshop ID</Text>
                <Pressable style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const feedbackBgColor =
        feedback.type === "success"
            ? "#10b981"
            : feedback.type === "error"
                ? "#ef4444"
                : "#3b82f6";

    return (
        <KeyboardAvoidingView
            behavior={behaviour}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        {/* Camera View */}
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            onBarcodeScanned={handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                            facing="back"
                        >
                        </CameraView>

                        {/* Overlay: QR Scanner Frame */}
                        <View style={styles.overlayContainer}>
                            <View style={styles.scanFrame} />
                            <Text style={styles.scanLabel}>{"Scan the student's QR code"}</Text>
                        </View>

                        {/* Back Button */}
                        <Pressable
                            style={styles.backButton}
                            onPress={() => router.replace(`/workshop/${workshopId}`)}
                        >
                            <Text style={styles.backButtonText}>← Go Back</Text>
                        </Pressable>

                        {/* Bottom Manual Input Section */}
                        <View style={styles.bottomPanel}>
                            <View style={styles.manualInputContainer}>
                                <Text style={styles.manualInputLabel}>Or enter Student ID:</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter student ID"
                                        placeholderTextColor="#9ca3af"
                                        value={manualMSSV}
                                        onChangeText={setManualMSSV}
                                        editable={!isProcessing}
                                        autoCapitalize="none"
                                    />
                                    <Pressable
                                        style={[
                                            styles.confirmButton,
                                            isProcessing && styles.buttonDisabled,
                                        ]}
                                        onPress={handleConfirmMSSV}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Text style={styles.confirmButtonText}>Confirm</Text>
                                        )}
                                    </Pressable>
                                </View>

                                {/* Stats */}
                                <View style={styles.statsRow}>
                                    <Text style={styles.statsLabel}>
                                        Checked in: <Text style={styles.statsValue}>{scannedCount}</Text>
                                    </Text>
                                    <Text style={styles.statusLabel}>
                                        {isOnline ? "🟢 Online" : "🔴 Offline"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Feedback Overlay */}
                        {feedback.show && (
                            <Animated.View
                                style={[
                                    styles.feedbackBanner,
                                    {
                                        backgroundColor: feedbackBgColor,
                                        opacity: feedbackAnimValue,
                                        transform: [
                                            {
                                                translateY: feedbackAnimValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-60, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <Text style={styles.feedbackText}>{feedback.message}</Text>
                            </Animated.View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
    },

    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-start",
        paddingTop: "50%",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    camera: {
        flex: 1,
        zIndex: 1,
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: "#3b82f6",
        borderRadius: 12,
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        zIndex: 2,
    },
    scanLabel: {
        marginTop: 24,
        color: "#93c5fd",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        zIndex: 2,
    },
    bottomPanel: {
        backgroundColor: "#0f172a",
        // width: '100%',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        zIndex: 3,
    },
    manualInputContainer: {
        gap: 12,
    },
    manualInputLabel: {
        color: "#e2e8f0",
        fontSize: 14,
        fontWeight: "600",
    },
    inputRow: {
        flexDirection: "row",
        gap: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        borderWidth: 1,
        borderColor: "#475569",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    confirmButton: {
        backgroundColor: "#1d4ed8",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 14,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statsLabel: {
        color: "#94a3b8",
        fontSize: 12,
    },
    statsValue: {
        color: "#3b82f6",
        fontWeight: "700",
    },
    statusLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "600",
    },
    feedbackBanner: {
        position: "absolute",
        top: 20,
        left: 20,
        right: 20,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 1000,
    },
    feedbackText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        width: 100,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    backButtonText: {
        color: "#f1f5f9",
        fontWeight: "600",
        fontSize: 14,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#1d4ed8",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 14,
    },
});

