import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useGetCurrentUser } from "./queries";

export const useInitUser = () => {
    const { setUser, clearAuth, accessToken } = useAuthStore();

    console.log("🔄 useInitUser hook initialized");
    console.log("📝 Current accessToken:", accessToken ? "exists" : "null");

    // Always try to fetch user on mount - the refresh token in cookies will work
    const { data, isError, isSuccess, isFetching } = useGetCurrentUser({
        enabled: true, // Always enabled - let the refresh token handle authentication
        retry: 1,
    });

    console.log("🔍 Query state:", { isSuccess, isError, isFetching, hasData: !!data });

    useEffect(() => {
        if (isSuccess && data?.user) {
            console.log("✅ User data fetched successfully:", data.user);
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
            console.log("❌ Failed to fetch user, clearing auth state");
            // If fetching user fails, clear auth state
            clearAuth();
        }
    }, [isError, clearAuth]);
};



