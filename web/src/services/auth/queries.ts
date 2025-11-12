import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import type { UserProfileResponse, ApiResponse } from "./types";


const authApi = {
    getCurrentUser: async (): Promise<UserProfileResponse> => {
        console.log("🌐 Making API call to /auth/me...");
        try {
            const { data } = await api.get<ApiResponse<UserProfileResponse>>("/auth/me");
            console.log("✅ /auth/me response:", data);
            return data.data!;
        } catch (error) {
            console.error("❌ /auth/me failed:", error);
            throw error;
        }
    },
};

export const useGetCurrentUser = (
    options?: Omit<
        UseQueryOptions<UserProfileResponse, Error>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery<UserProfileResponse, Error>({
        queryKey: QUERY_KEYS.AUTH.ME,
        queryFn: authApi.getCurrentUser,
        staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 mins
        gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 mins
        retry: 1,
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
        ...options,
    });
};

const authQueries = {
    api: authApi,
    useGetCurrentUser,
};

export default authQueries;