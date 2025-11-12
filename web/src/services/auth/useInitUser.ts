import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useGetCurrentUser } from "./queries";

export const useInitUser = () => {
    const { setUser, clearAuth } = useAuthStore();

    // Always try to fetch user on mount - the refresh token in cookies will work
    const { data, isError, isSuccess } = useGetCurrentUser({
        enabled: true, // Always enabled - let the refresh token handle authentication
        retry: 1,
    });


    useEffect(() => {
        if (isSuccess && data?.user) {
            setUser(data.user)
        }
    }, [isSuccess, data, setUser]);

    useEffect(() => {
        if (isError) {
            // If fetching user fails, clear auth state
            clearAuth();
        }
    }, [isError, clearAuth]);
};



