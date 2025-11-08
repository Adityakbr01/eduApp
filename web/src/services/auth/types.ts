// Auth Types
export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    roleId: string;
    roleName: string;
    isEmailVerified: boolean;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    isBanned: boolean;
    permissions: string[];
    address?: string;
}

// Request Types
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role: string;
    instructorProfile?: {
        bio?: string;
        expertise?: string[];
        experience?: number;
    };
    managerProfile?: {
        department?: string;
        teamSize?: number;
    };
    supportTeamProfile?: {
        shiftTimings?: string;
        expertiseAreas?: string[];
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface VerifyRegisterOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyResetPasswordOtpRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Response Types
export interface AuthResponse {
    message: string;
    userId?: string;
    email?: string;
    isEmailVerified?: boolean;
    permissions?: string[];
    approvalStatus?: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface UserProfileResponse {
    message: string;
    user: User;
}

export interface OtpResponse {
    message?: string;
    meta?: {
        otpExpiry: string;
    };
    success?: boolean;
    statusCode?: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Array<{
        path: string;
        message: string;
    }>;
}