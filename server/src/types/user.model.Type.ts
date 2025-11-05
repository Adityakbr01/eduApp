import type { Types } from "mongoose";
import type { Role } from "src/constants/roles.js";


export enum approvalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface InstructorProfile {
    bio?: string;
    expertise?: string[];
    experience?: number;
}

export interface StudentProfile {
    enrolledCourses?: string[];
    progress?: Record<string, number>; // courseId -> progress
}

export interface ManagerProfile {
    department?: string;
    teamSize?: number;
}

export interface SupportTeamProfile {
    shiftTimings?: string;
    expertiseAreas?: string[];
}

export interface IUser {
    _id: Types.ObjectId
    name: string;
    email: string;
    password: string;
    roleId: Types.ObjectId;

    accessToken?: string;
    refreshToken?: string;
    verifyOtp?: string;
    verifyOtpExpiry?: Date;

    isEmailVerified: boolean;
    phone?: string;
    address?: string;

    approvalStatus?: approvalStatus;
    approvedBy?: Types.ObjectId;

    permissions?: string[];

    isBanned: boolean;
    isManagerApproved?: boolean;
    isInstructorApproved?: boolean;
    isSupportTeamApproved?: boolean;

    instructorProfile?: InstructorProfile;
    studentProfile?: StudentProfile;
    managerProfile?: ManagerProfile;
    supportTeamProfile?: SupportTeamProfile;

    comparePassword: (password: string) => Promise<boolean>;
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
}
