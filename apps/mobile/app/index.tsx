import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, useRootNavigationState, useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import {
  getPublishedWorkshops,
  type LocalWorkshop,
} from "../db/checkinRepository";

export default function Index() {
  const router = useRouter();
  const rootNavState = useRootNavigationState();
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const [workshops, setWorkshops] = useState<LocalWorkshop[]>([]);
  const [isWorkshopLoading, setIsWorkshopLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWorkshops = useCallback(() => {
    setIsWorkshopLoading(true);
    try {
      setWorkshops(getPublishedWorkshops());
    } finally {
      setIsWorkshopLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!rootNavState?.key || !isAuthenticated) {
      return;
    }

    loadWorkshops();
  }, [isAuthenticated, loadWorkshops, rootNavState?.key]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    try {
      setWorkshops(getPublishedWorkshops());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const openWorkshopDetail = useCallback(
    (workshopId: string) => {
      router.push({
        pathname: "/workshop/[id]",
        params: { id: workshopId },
      });
    },
    [router]
  );

  const renderWorkshopCard = useCallback(
    ({ item }: { item: LocalWorkshop }) => (
      <Pressable
        style={styles.workshopCard}
        onPress={() => openWorkshopDetail(item.id)}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.workshopTitle}>{item.title}</Text>
            <Text style={styles.workshopDescription} numberOfLines={2}>
              {item.description || "No description available."}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>
      </Pressable>
    ),
    [openWorkshopDetail]
  );

  const emptyState = useMemo(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIllustration}>
          <Text style={styles.emptyIllustrationText}>UH</Text>
        </View>
        <Text style={styles.emptyTitle}>No published workshops</Text>
        <Text style={styles.emptySubtitle}>
          Workshop data will appear here after syncing from the QR workflow.
        </Text>
      </View>
    ),
    []
  );

  if (isLoading || !rootNavState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.staffName}>{user?.name || user?.email || "Staff"}</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Published Workshops</Text>
        <Text style={styles.sectionSubtitle}>
          Tap a workshop to inspect registrations.
        </Text>
      </View>

      {isWorkshopLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={styles.centerLoadingText}>Loading workshops...</Text>
        </View>
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkshopCard}
          contentContainerStyle={
            workshops.length === 0 ? styles.listEmptyContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#60a5fa"
            />
          }
          ListEmptyComponent={emptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Pressable
        style={styles.syncButton}
        onPress={() => router.push("/sync-workshop")}
      >
        <Text style={styles.syncButtonText}>Scan Workshop QR Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0f172a",
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
    color: "#cbd5f5",
    marginBottom: 4,
  },
  staffName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#1f2937",
  },
  logoutText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#cbd5f5",
  },
  listContainer: {
    paddingBottom: 100,
  },
  listEmptyContainer: {
    flexGrow: 1,
  },
  workshopCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  workshopTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 6,
  },
  workshopDescription: {
    fontSize: 13,
    color: "#cbd5f5",
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
  },
  badgeText: {
    color: "#86efac",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    letterSpacing: 1,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#cbd5f5",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 19,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLoadingText: {
    marginTop: 12,
    color: "#cbd5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  syncButton: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  syncButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
