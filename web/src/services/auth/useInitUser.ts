import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useGetCurrentUser } from "./queries";

export const useInitUser = () => {
    const { setUser, clearAuth, accessToken } = useAuthStore();

    const { data, isError, isSuccess } = useGetCurrentUser({
        enabled: !!accessToken,
        retry: 1,
    });

    useEffect(() => {
        if (isSuccess && data?.user) {
            setUser({
                id: data.user._id,
                _id: data.user._id,
                email: data.user.email,
                phone: data.user.phone || "",
                name: data.user.name,
                role: data.user.roleName,
            });
        }
    }, [isSuccess, data, setUser]);

    useEffect(() => {
        if (isError) {
            // If fetching user fails, clear auth state
            clearAuth();
        }
    }, [isError, clearAuth]);
};



