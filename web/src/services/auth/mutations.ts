import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { QUERY_KEYS } from "@/config/query-keys";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import type {
    RegisterRequest,
    LoginRequest,
    SendOtpRequest,
    VerifyRegisterOtpRequest,
    VerifyResetPasswordOtpRequest,
    ChangePasswordRequest,
    AuthResponse,
    OtpResponse,
    ApiResponse,
} from "./types";


const authApi = {
    /**
     * Register a new user
     */
    register: async (data: RegisterRequest): Promise<OtpResponse> => {
        const response = await api.post<ApiResponse<OtpResponse>>("/auth/register", data);
        return response.data.data!;
    },

    /**
     * Send registration OTP
     */
    sendRegisterOtp: async (data: SendOtpRequest): Promise<OtpResponse> => {
        const response = await api.post<ApiResponse<OtpResponse>>("/auth/register/send-otp", data);
        return response.data.data!;
    },

    /**
     * Verify registration OTP
     */
    verifyRegisterOtp: async (data: VerifyRegisterOtpRequest): Promise<OtpResponse> => {
        const response = await api.post<ApiResponse<OtpResponse>>("/auth/register/verify-otp", data);
        return response.data.data!;
    },

    /**
     * Login user
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
        return response.data.data!;
    },

    /**
     * Send password reset OTP
     */
    sendResetPasswordOtp: async (data: SendOtpRequest): Promise<OtpResponse> => {
        const response = await api.post<ApiResponse<OtpResponse>>("/auth/reset-password/send-otp", data);
        return response.data.data!;
    },

    /**
     * Verify password reset OTP and set new password
     */
    verifyResetPasswordOtp: async (data: VerifyResetPasswordOtpRequest): Promise<OtpResponse> => {
        const response = await api.post<ApiResponse<OtpResponse>>("/auth/reset-password/verify-otp", data);
        return response.data.data!;
    },

    /**
     * Change password
     */
    changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
        const response = await api.post<ApiResponse<{ message: string }>>("/auth/change-password", data);
        return response.data.data!;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (): Promise<{ accessToken: string }> => {
        const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/token-refresh");
        return response.data.data!;
    },

    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    },
};

const useRegister = (
    options?: UseMutationOptions<OtpResponse, Error, RegisterRequest>
) => {
    return useMutation<OtpResponse, Error, RegisterRequest>({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            toast.success(data.message || "Registration successful! Please verify your email.");
        },
        onError: (error) => {
            console.error("Registration failed:", error);
        },
        ...options,
    });
};

const useSendRegisterOtp = (
    options?: UseMutationOptions<OtpResponse, Error, SendOtpRequest>
) => {
    return useMutation<OtpResponse, Error, SendOtpRequest>({
        mutationFn: authApi.sendRegisterOtp,
        onSuccess: (data) => {
            toast.success(data.message || "OTP sent successfully!");
        },
        ...options,
    });
};

const useVerifyRegisterOtp = (
    options?: UseMutationOptions<OtpResponse, Error, VerifyRegisterOtpRequest>
) => {
    return useMutation<OtpResponse, Error, VerifyRegisterOtpRequest>({
        mutationFn: authApi.verifyRegisterOtp,
        onSuccess: (data) => {
            toast.success(data.message || "Email verified successfully!");
        },
        ...options,
    });
};

const useLogin = (
    options?: UseMutationOptions<AuthResponse, Error, LoginRequest>
) => {
    const { setAccessToken, setUser } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, LoginRequest>({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            // Store access token
            if (data.accessToken) {
                setAccessToken(data.accessToken);
            }

            // Store user data
            if (data.userId && data.email) {
                setUser({
                    id: data.userId,
                    email: data.email,
                    name: "", // Will be updated when fetching profile
                    role: "",
                    phone: "",
                });
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });

            toast.success("Login successful!");
        },
        onError: (error) => {
            console.error("❌ Login mutation failed:", error);
        },
        ...options,
    });
};

const useSendResetPasswordOtp = (
    options?: UseMutationOptions<OtpResponse, Error, SendOtpRequest>
) => {
    return useMutation<OtpResponse, Error, SendOtpRequest>({
        mutationFn: authApi.sendResetPasswordOtp,
        onSuccess: (data) => {
            toast.success(data.message || "Password reset OTP sent!");
        },
        ...options,
    });
};

const useVerifyResetPasswordOtp = (
    options?: UseMutationOptions<OtpResponse, Error, VerifyResetPasswordOtpRequest>
) => {
    return useMutation<OtpResponse, Error, VerifyResetPasswordOtpRequest>({
        mutationFn: authApi.verifyResetPasswordOtp,
        onSuccess: (data) => {
            toast.success(data.message || "Password reset successfully!");
        },
        ...options,
    });
};

const useChangePassword = (
    options?: UseMutationOptions<{ message: string }, Error, ChangePasswordRequest>
) => {
    const { clearAuth } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, Error, ChangePasswordRequest>({
        mutationFn: authApi.changePassword,
        onSuccess: (data) => {
            toast.success(data.message || "Password changed successfully! Please login again.");
            clearAuth();

            // Clear all queries
            queryClient.clear();
        },
        ...options,
    });
};

const useRefreshToken = (
    options?: UseMutationOptions<{ accessToken: string }, Error, void>
) => {
    const { setAccessToken } = useAuthStore();

    return useMutation<{ accessToken: string }, Error, void>({
        mutationFn: authApi.refreshToken,
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
        },
        ...options,
    });
};

const useLogout = (
    options?: UseMutationOptions<void, Error, void>
) => {
    const { clearAuth } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation<void, Error, void>({
        mutationFn: authApi.logout,
        onSuccess: () => {
            clearAuth();

            queryClient.clear();

            toast.success("Logged out successfully!");
        },
        onError: (error) => {
            console.error("Logout failed:", error);
            clearAuth();
            queryClient.clear();
        },
        ...options,
    });
};

const authMutations = {
    // API functions
    api: authApi,

    // Mutation hooks
    useRegister,
    useSendRegisterOtp,
    useVerifyRegisterOtp,
    useLogin,
    useSendResetPasswordOtp,
    useVerifyResetPasswordOtp,
    useChangePassword,
    useRefreshToken,
    useLogout,
};

export default authMutations;