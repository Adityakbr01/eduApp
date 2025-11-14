// Single User object inside data.data
export interface ApprovedUser {
    approvedBy: string | null;
    _id: string;
    name: string;
    email: string;
    roleId: string;
    isEmailVerified: boolean;
    phone: string;
    approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
    permissions: string[];
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// API response structure
export interface ApproveUserResponse {
    success: boolean;
    message: string;
    data: {
        message: string;
        data: ApprovedUser;
    };
    meta: unknown | null;
    timestamp: string;
    path: string;
    statusCode: number;
}

// Payload you send to backend
export interface ApproveUserPayload {
    userId: string;
}
