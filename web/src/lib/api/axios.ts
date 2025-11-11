// api/axios.ts
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth"; // adjust the path as needed

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1",
    withCredentials: true, // ensures cookies (refresh token) are sent
});


interface FailedRequestQueueItem {
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void; // use unknown instead of any
}
// === Refresh Token Handling ===
let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// === Request Interceptor ===
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
});

// === Response Interceptor ===
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // ✅ Check if token expired and request hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // ✅ Queue requests until refresh is done
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        const typedToken = token as string;
                        originalRequest.headers["Authorization"] = `Bearer ${typedToken}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            const { setAccessToken, clearAuth } = useAuthStore.getState();

            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1"}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data?.data?.accessToken;

                if (newAccessToken) {
                    setAccessToken(newAccessToken);
                    processQueue(null, newAccessToken);

                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return api(originalRequest); // ✅ Retry with new token
                } else {
                    throw new Error("No access token in refresh response");
                }
            } catch (err) {
                processQueue(err, null);
                clearAuth();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // === Global error toast handler ===
        if (error.response) {
            const status = error.response.status;
            const msg = error?.response?.data?.message || "Something went wrong";

            if (status === 429) toast.error("Too many requests. Please try again.");
            else if (status >= 500) toast.error("Server error. Please try again later.");
            else toast.error(msg);
        } else {
            toast.error("Network error. Check your internet connection.");
        }

        return Promise.reject(error);
    }
);

export default api;