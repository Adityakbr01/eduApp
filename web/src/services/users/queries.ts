import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import { User } from "../auth";


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    statusCode: number;
    path: string;
    timestamp: string;
    meta?: {
        pagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        [key: string]: unknown;
    };
}



interface UsersApiResult {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}


export type UsersQueryParams = {
    page?: number;
    limit?: number;
};

const usersApi = {
    getUsers: async (params: UsersQueryParams = {}): Promise<UsersApiResult> => {
        const res = await api.get<ApiResponse<UsersApiResult>>("/users", { params });
        return {
            users: res.data.data?.users || [],
            pagination: res.data.data?.pagination || res.data.meta?.pagination || {
                total: 0,
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                totalPages: 0,
                hasNext: true,
                hasPrev: true,
            },
        };
    },
};



export const useGetUsers = (
    params?: UsersQueryParams,
    options?: Omit<
        UseQueryOptions<UsersApiResult, Error>,
        "queryKey" | "queryFn"
    >,
) => {
    const queryParams = params ?? {};
    return useQuery<UsersApiResult, Error>({
        queryKey: [QUERY_KEYS.USERS.ALL, queryParams],
        queryFn: () => usersApi.getUsers(queryParams),
        staleTime: 2 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        ...options,
    });
};


const usersQueries = {
    api: usersApi,
    useGetUsers,
};

export default usersQueries;
