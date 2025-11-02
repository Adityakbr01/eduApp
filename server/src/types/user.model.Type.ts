import type { Role } from "src/constants/roles.js";

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
    name: string;
    email: string;
    password: string;
    role: Role;
    isBanned: boolean;
    isManagerApproved: boolean;
    isInstructorApproved: boolean;
    isSupportTeamApproved: boolean;

    instructorProfile?: InstructorProfile;
    studentProfile?: StudentProfile;
    managerProfile?: ManagerProfile;
    supportTeamProfile?: SupportTeamProfile;
}
