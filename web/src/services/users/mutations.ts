import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApproveUserPayload, ApproveUserResponse } from "./types";


const userApi = {
    approveUser: async (payload: ApproveUserPayload): Promise<ApproveUserResponse> => {
        const response = await api.post<ApproveUserResponse>(
            `/users/approved-user/${payload.userId}`,
            payload
        );

        return response.data;
    },
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


const userMutations = {
    useApproveUser,
};

export default userMutations;
