import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import { User } from "../auth";


interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    statusCode: number;
    path: string;
    timestamp: string;
    meta?: unknown;
}


const usersApi = {
    getUsers: async (): Promise<User[]> => {
        const res = await api.get<ApiResponse<User[]>>("/users");
        console.log("API Response for getUsers:", res.data);
        return res.data.data!;
    },
};


export const useGetUsers = (
    options?: Omit<
        UseQueryOptions<User[], Error>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery<User[], Error>({
        queryKey: [QUERY_KEYS.USERS.ALL],
        queryFn: usersApi.getUsers,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
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
