import * as SecureStore from "expo-secure-store";
import api from "./api";
import axios, { AxiosError } from "axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const SESSION_KEY = "auth_session";

export type AuthUser = {
    id?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
};

export type AuthError = {
    status: number | null;
    code?: string;
    message: string;
};

type AuthResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: AuthError };

type LoginResponse = {
    token?: string;
    accessToken?: string;
    session?: {
        token?: string;
        accessToken?: string;
        user?: AuthUser;
        [key: string]: unknown;
    };
    user?: AuthUser;
    [key: string]: unknown;
};

const parseAuthError = (error: unknown): AuthError => {
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

const extractToken = (data: LoginResponse): string | null => {
    return (
        data.token ||
        data.accessToken ||
        data.session?.token ||
        data.session?.accessToken ||
        null
    );
};

const extractUser = (data: LoginResponse): AuthUser | null => {
    return data.user || data.session?.user || null;
};

const saveAuthSession = async (
    token: string | null,
    user: AuthUser | null,
    session: unknown
) => {
    if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    }

    if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
        await SecureStore.deleteItemAsync(USER_KEY);
    }

    if (session) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
    }
};

export const login = async (
    email: string,
    password: string
): Promise<AuthResult<{ token: string | null; user: AuthUser | null }>> => {
    try {
        const response = await api.post<LoginResponse>("/auth/sign-in/email", {
            email,
            password,
        });

        const token = extractToken(response.data);
        const user = extractUser(response.data);

        await saveAuthSession(token, user, response.data.session ?? null);

        return { ok: true, data: { token, user } };
    } catch (error) {
        return { ok: false, error: parseAuthError(error) };
    }
};

export const logout = async (): Promise<AuthResult<void>> => {
    try {
        await api.post("/auth/sign-out");
        await saveAuthSession(null, null, null);
        return { ok: true, data: undefined };
    } catch (error) {
        await saveAuthSession(null, null, null);
        return { ok: false, error: parseAuthError(error) };
    }
};
