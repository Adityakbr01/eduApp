// store/auth.ts
import { create } from "zustand";
import { secureLocalStorage } from "@/lib/utils/encryption";

export enum approvalStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface User {
    _id: string;
    name: string;
    email: string;
    roleId: string;
    roleName: string;
    isEmailVerified: boolean;
    approvalStatus: approvalStatusEnum;
    isBanned: boolean;
    permissions: string[];
    phone?: string;
    address?: string;
}




export interface AuthState {
    accessToken: string | null;
    user: User | null;
    setAccessToken: (token: string | null) => void;
    setUser: (user: User) => void;
    clearAuth: () => void;
}


// ✅ Safe get from localStorage with encryption
const getUserFromLocalStorage = (): User | null => {
    if (typeof window !== "undefined") {
        return secureLocalStorage.getItem<User>("user");
    }
    return null;
};

// Get persisted access token if available
const getPersistedToken = (): string | null => {
    if (typeof window !== "undefined") {
        return secureLocalStorage.getItem<string>("accessToken");
    }
    return null;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: getPersistedToken(),
    user: getUserFromLocalStorage(),
    setAccessToken: (token) => {
        set({ accessToken: token });
        if (typeof window !== "undefined") {
            if (token) {
                secureLocalStorage.setItem("accessToken", token);
            } else {
                secureLocalStorage.removeItem("accessToken");
            }
        }
    },
    setUser: (user) => {
        set({ user });
        if (typeof window !== "undefined") {
            secureLocalStorage.setItem("user", user);
        }
    },
    clearAuth: () => {
        set({ accessToken: null, user: null });
        if (typeof window !== "undefined") {
            secureLocalStorage.removeItem("user");
            secureLocalStorage.removeItem("accessToken");
        }
    },
}));