import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import type { UserProfileResponse, ApiResponse } from "./types";


const authApi = {
    getCurrentUser: async (): Promise<UserProfileResponse> => {
        const { data } = await api.get<ApiResponse<UserProfileResponse>>("/auth/me");
        return data.data!;
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        ...options,
    });
};

const authQueries = {
    api: authApi,
    useGetCurrentUser,
};

export default authQueries;