import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "../services/authService";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

type AuthState = {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (params: { user: AuthUser | null; token: string | null }) => void;
    logout: () => Promise<void>;
    clearAuth: () => Promise<void>;
    hydrate: () => Promise<void>;
};

const readStoredAuth = async (): Promise<{
    user: AuthUser | null;
    token: string | null;
}> => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userRaw = await SecureStore.getItemAsync(USER_KEY);

    let user: AuthUser | null = null;
    if (userRaw) {
        try {
            user = JSON.parse(userRaw) as AuthUser;
        } catch {
            user = null;
        }
    }

    return { token, user };
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    setAuth: ({ user, token }) =>
        set({
            user,
            token,
            isAuthenticated: Boolean(token),
            isLoading: false,
        }),
    logout: async () => {
        const module = await import("../services/authService");
        await module.logout();
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
    clearAuth: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
    hydrate: async () => {
        set({ isLoading: true });
        const { token, user } = await readStoredAuth();
        set({
            user,
            token,
            isAuthenticated: Boolean(token),
            isLoading: false,
        });
    },
}));
