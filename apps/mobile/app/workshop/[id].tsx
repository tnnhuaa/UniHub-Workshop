import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    getPublishedWorkshops,
    getRegistrationsWithStatus,
    type LocalWorkshop,
} from "../../db/checkinRepository";
import type { WorkshopRegistrationWithStatus } from "../../types/checkins.type";
import { useAutoSyncDown } from "@/hooks/useAutoSyncDown";

export default function WorkshopDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const workshopId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [isLoading, setIsLoading] = useState(true);
    const [workshop, setWorkshop] = useState<LocalWorkshop | null>(null);
    const [registrations, setRegistrations] = useState<WorkshopRegistrationWithStatus[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { isSyncing } = useAutoSyncDown(workshopId as string, () => {
        loadWorkshop();
    });

    const loadWorkshop = useCallback(() => {
        if (!workshopId) {
            setWorkshop(null);
            setRegistrations([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const selectedWorkshop = getPublishedWorkshops().find(
                (item) => item.id === workshopId
            );
            setWorkshop(selectedWorkshop ?? null);
            setRegistrations(getRegistrationsWithStatus(workshopId));
        } finally {
            setIsLoading(false);
        }
    }, [workshopId]);

    useEffect(() => {
        loadWorkshop();
    }, [loadWorkshop]);

    const filteredRegistrations = useMemo(() => {
        const normalized = searchQuery.trim().toLowerCase();
        if (!normalized) {
            return registrations;
        }

        return registrations.filter((registration) => {
            return (
                registration.mssv.toLowerCase().includes(normalized) ||
                registration.fullName?.toLowerCase().includes(normalized) ||
                registration.faculty?.toLowerCase().includes(normalized)
            );
        });
    }, [registrations, searchQuery]);

    const checkedInCount = useMemo(
        () => registrations.filter((registration) => registration.isCheckedIn).length,
        [registrations]
    );

    const handleStartCheckin = () => {
        if (!workshopId) {
            return;
        }

        router.push({ pathname: "/scanner/[id]", params: { id: workshopId } });
    };

    const renderStudent = ({ item }: { item: WorkshopRegistrationWithStatus }) => {
        const badge = item.syncStatus === "synced"
            ? { label: "Synced", color: "#22c55e", bg: "rgba(34, 197, 94, 0.14)" }
            : item.syncStatus === "pending"
                ? { label: "Pending", color: "#eab308", bg: "rgba(234, 179, 8, 0.14)" }
                : item.isCheckedIn
                    ? { label: "Checked-in", color: "#22c55e", bg: "rgba(34, 197, 94, 0.14)" }
                    : { label: "Not Checked-in", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.14)" };

        return (
            <View style={styles.studentRow}>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>
                        {item.fullName || "Unnamed student"}
                    </Text>
                    <Text style={styles.studentMeta}>{item.mssv}</Text>
                    <Text style={styles.studentMeta}>{item.faculty || "No faculty"}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                        {badge.label}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#60a5fa" />
                <Text style={styles.loadingText}>Loading workshop...</Text>
            </View>
        );
    }

    if (!workshop) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.notFoundWrap}>
                    <Text style={styles.notFoundTitle}>Workshop not found</Text>
                    <Text style={styles.notFoundText}>
                        Please return to the home screen and select a published workshop.
                    </Text>
                    <Pressable style={styles.backButton} onPress={() => router.replace("/")}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.topNav}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.replace("/")}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </Pressable>

                {isSyncing && (
                    <View style={styles.syncIndicator}>
                        <ActivityIndicator size="small" color="#60a5fa" />
                        <Text style={styles.syncText}>Syncing...</Text>
                    </View>
                )}
            </View>

            <View style={styles.headerCard}>
                <Text style={styles.headerTitle}>{workshop.title}</Text>
                <Text style={styles.headerDescription}>
                    {workshop.description || "No description available."}
                </Text>

                <View style={styles.summaryRow}>
                    <View style={styles.summaryPill}>
                        <Text style={styles.summaryValue}>{checkedInCount}</Text>
                        <Text style={styles.summaryLabel}>Checked-in</Text>
                    </View>
                    <View style={styles.summaryPill}>
                        <Text style={styles.summaryValue}>{registrations.length}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={styles.summaryPill}>
                        <Text style={styles.summaryValue}>
                            {workshop.status === "published" ? "Active" : "Inactive"}
                        </Text>
                        <Text style={styles.summaryLabel}>Status</Text>
                    </View>
                </View>
            </View>

            <View style={styles.searchWrap}>
                <TextInput
                    placeholder="Search by name or MSSV"
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </View>

            <FlatList
                data={filteredRegistrations}
                keyExtractor={(item) => item.registrationId}
                renderItem={renderStudent}
                contentContainerStyle={
                    filteredRegistrations.length === 0 ? styles.emptyListContainer : styles.listContainer
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIllustration}>
                            <Text style={styles.emptyIllustrationText}>0</Text>
                        </View>
                        <Text style={styles.emptyTitle}>No students registered yet</Text>
                        <Text style={styles.emptySubtitle}>
                            The workshop has no registrations or your search returned no matches.
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.bottomBar}>
                <Pressable style={styles.startButton} onPress={handleStartCheckin}>
                    <Text style={styles.startButtonText}>Start Check-in</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#0f172a",
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
    },
    loadingText: {
        marginTop: 12,
        color: "#cbd5e1",
    },
    notFoundWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    notFoundTitle: {
        color: "#f8fafc",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 10,
    },
    notFoundText: {
        color: "#cbd5e1",
        textAlign: "center",
        marginBottom: 18,
    },
    headerCard: {
        backgroundColor: "#111827",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: "#1e3a8a",
        marginBottom: 14,
    },
    headerTitle: {
        color: "#f8fafc",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 8,
    },
    headerDescription: {
        color: "#cbd5e1",
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 10,
    },
    summaryPill: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: "rgba(96, 165, 250, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(96, 165, 250, 0.22)",
        alignItems: "center",
    },
    summaryValue: {
        color: "#f8fafc",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    summaryLabel: {
        color: "#93c5fd",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    searchWrap: {
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: "#111827",
        borderWidth: 1,
        borderColor: "#1e3a8a",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#f8fafc",
    },
    listContainer: {
        paddingBottom: 110,
    },
    emptyListContainer: {
        flexGrow: 1,
        paddingBottom: 110,
    },
    studentRow: {
        backgroundColor: "#111827",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1e3a8a",
        padding: 16,
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        marginBottom: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        color: "#f8fafc",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },
    studentMeta: {
        color: "#cbd5e1",
        fontSize: 13,
        marginBottom: 2,
    },
    statusBadge: {
        alignSelf: "center",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    emptyIllustration: {
        width: 88,
        height: 88,
        borderRadius: 28,
        backgroundColor: "rgba(96, 165, 250, 0.16)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    emptyIllustrationText: {
        color: "#93c5fd",
        fontSize: 22,
        fontWeight: "800",
    },
    emptyTitle: {
        color: "#f8fafc",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptySubtitle: {
        color: "#cbd5e1",
        textAlign: "center",
        lineHeight: 19,
    },
    bottomBar: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 18,
    },
    startButton: {
        backgroundColor: "#1d4ed8",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        shadowColor: "#1d4ed8",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    startButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "800",
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        height: 40,
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#1e293b', // Màu nền hơi xám xanh
    },
    backButtonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '600',
    },
    syncIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    syncText: {
        color: '#60a5fa',
        fontSize: 12,
        fontWeight: '500',
    },
});
