import axios from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "";
const originURL = baseURL ? new URL(baseURL).origin : "";

console.log("Request Origin:", originURL);

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        Origin: originURL,
        Referer: `${originURL}/`,
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (originURL) {
        config.headers.set('Origin', originURL);
        config.headers.set('Referer', `${originURL}/`);
    }

    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            const { clearAuth } = useAuthStore.getState();
            void clearAuth();
        }
        return Promise.reject(error);
    }
);

export default api;