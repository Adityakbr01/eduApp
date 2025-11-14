import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApiResult, ApproveUserPayload, ApproveUserResponse } from "./types";




const userApi = {
    approveUser: async (payload: ApproveUserPayload): Promise<ApproveUserResponse> => {
        const response = await api.post<ApproveUserResponse>(
            `/users/approved-user/${payload.userId}`,
            payload
        );

        return response.data;
    },
    banUser: async (payload: { userId: string }): Promise<ApiResult<null>> => {
        const response = await api.post(
            `/users/user-ban-unban/${payload.userId}`,
            payload
        );

        return response.data;
    },
    deleteUser: async (userId: string): Promise<ApiResult<null>> => {
        const response = await api.delete<ApiResult<null>>(
            `/users/${userId}`
        );
        return response.data;
    }
};


// -----------------------------------------
// MUTATION HOOK
// -----------------------------------------
const useApproveUser = (
    options?: UseMutationOptions<
        ApproveUserResponse, // success response
        Error,               // error type
        ApproveUserPayload   // payload type
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        ApproveUserResponse,
        Error,
        ApproveUserPayload
    >({
        mutationFn: userApi.approveUser,

        onSuccess: () => {
            toast.success("User approved successfully");

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },

        onError: (error) => {
            console.error("User approval failed:", error);

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },

        ...options,
    });
};

const useBanUser = (
    options?: UseMutationOptions<
        ApiResult<null>, // success response
        Error, // error type
        { userId: string } // payload type
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResult<null>,
        Error,
        { userId: string }
    >({
        mutationFn: userApi.banUser,

        onSuccess: (api) => {
            toast.success(api.message);

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },

        onError: (error) => {
            console.error("User ban failed:", error);

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },

        ...options,
    });
};

const useDeleteUser = (
    options?: UseMutationOptions<
        ApiResult<null>, // success response
        Error, // error type
        string // userId type
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResult<null>,
        Error,
        string
    >({
        mutationFn: userApi.deleteUser,
        onSuccess: (api) => {
            toast.success(api.message);
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },
        onError: (error) => {
            console.error("User deletion failed:", error);
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS.ALL],
            });
        },
        ...options,
    });
};


const userMutations = {
    useApproveUser,
    useBanUser,
    useDeleteUser,
};

export default userMutations;
