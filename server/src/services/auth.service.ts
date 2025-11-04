import { ROLES } from "src/constants/roles.js";
import User from "src/models/user.model.js";
import { ApiError } from "src/utils/apiError.js";
import { generateOtp } from "src/utils/generateOtp.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";
import emailService, { EmailType } from "./otp.service.js";

const authService = {
    registerUser: async (data: RegisterSchemaInput) => {
        const existingUser = await User.findOne({ email: data.email });

        if (existingUser && existingUser.isEmailVerified && !existingUser.isBanned) {
            throw new ApiError({
                statusCode: 400,
                message: "Account already exists. Please login.",
                errors: [{ path: "email", message: "Email already registered" }],
            });
        }

        if (existingUser && existingUser.isBanned) {
            throw new ApiError({
                statusCode: 403,
                message: "Your account is banned",
                errors: [{ path: "email", message: "Email is banned" }],
            });
        }

        if (existingUser && !existingUser.isEmailVerified) {
            const { otp, expiry } = generateOtp();

            existingUser.verifyOtp = otp;
            existingUser.verifyOtpExpiry = expiry;
            await existingUser.save();

            await emailService.sendEmail(EmailType.VERIFY_OTP, {
                email: existingUser.email,
                otp,
            });

            throw new ApiError({
                statusCode: 400,
                message: "Account already exists. Please verify OTP sent to your email.",
            });
        }

        const { otp, expiry } = generateOtp();
        const profileData: Record<string, any> = {};

        if (data.role === ROLES.INSTRUCTOR) {
            profileData.instructorProfile = (data as any).instructorProfile;
            profileData.isInstructorApproved = false;
        }

        if (data.role === ROLES.MANAGER) {
            profileData.managerProfile = (data as any).managerProfile;
            profileData.isManagerApproved = false;
        }

        if (data.role === ROLES.SUPPORT) {
            profileData.supportTeamProfile = (data as any).supportTeamProfile;
            profileData.isSupportTeamApproved = false;
        }

        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            phone: data.phone,
            address: data.address,
            verifyOtp: otp,
            verifyOtpExpiry: expiry,
            ...profileData,
        });

        await emailService.sendEmail(EmailType.VERIFY_OTP, {
            email: user.email,
            otp,
        });

        return {
            message: "OTP sent to your email",
            userId: user._id,
            email: user.email,
            role: user.role,
        };
    },
    sendRegisterOtp: async (email: string) => {
        const user = await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry");

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "email", message: "No account associated with this email" }],
            });
        }

        if (user.isBanned) {
            throw new ApiError({
                statusCode: 403,
                message: "Your account is banned",
                errors: [{ path: "email", message: "Email is banned" }],
            });
        }

        if (user.isEmailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email is already verified",
                errors: [{ path: "email", message: "Email is already verified" }],
            });
        }

        const { otp, expiry } = generateOtp();

        user.verifyOtp = otp;
        user.verifyOtpExpiry = expiry;
        await user.save();
        await emailService.sendEmail(EmailType.VERIFY_OTP, {
            email: user.email,
            otp,
        });
    },
    verifyRegisterOtp: async (email: string, otp: string) => {
        const user = await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry");

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "email", message: "No account associated with this email" }],
            });
        }
        if (user.isEmailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email is already verified",
                errors: [{ path: "email", message: "Email is already verified" }],
            });
        }
        if (user.isBanned) {
            throw new ApiError({
                statusCode: 403,
                message: "Your account is banned",
                errors: [{ path: "email", message: "Email is banned" }],
            });
        }
        if (String(user.verifyOtp) !== String(otp) || !user.verifyOtpExpiry || user.verifyOtpExpiry < new Date()) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "Invalid or expired OTP" }],
            });
        }

        user.isEmailVerified = true;
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.approvedBy = undefined

        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        // Generate tokens upon successful verification
        if (user.role === ROLES.STUDENT) {
            accessToken = user.generateAccessToken();
            refreshToken = user.generateRefreshToken();
        }

        await user.save();

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email,
            role: user.role,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    },
    loginUser: async (email: string, password: string) => {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "email", message: "No account associated with this email" }],
            });
        }
        if (!user.isEmailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email is not verified",
                errors: [{ path: "email", message: "Please verify your email to login" }],
            });
        }
        if (user.isBanned) {
            throw new ApiError({
                statusCode: 403,
                message: "Your account is banned",
                errors: [{ path: "email", message: "Email is banned" }],
            });
        }

        if (user.role === ROLES.MANAGER && !user.isManagerApproved) {
            throw new ApiError({
                statusCode: 403,
                message: "Your manager account is not approved",
                errors: [{ path: "role", message: "Manager account is not approved" }],
            });
        }

        if (user.role === ROLES.INSTRUCTOR && !user.isInstructorApproved) {
            throw new ApiError({
                statusCode: 403,
                message: "Your instructor account is not approved",
                errors: [{ path: "role", message: "Instructor account is not approved" }],
            });
        }

        if (user.role === ROLES.SUPPORT && !user.isSupportTeamApproved) {
            throw new ApiError({
                statusCode: 403,
                message: "Your support team account is not approved",
                errors: [{ path: "role", message: "Support team account is not approved" }],
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid password",
                errors: [{ path: "password", message: "Incorrect password" }],
            });
        }

        user.accessToken = user.generateAccessToken();
        user.refreshToken = user.generateRefreshToken();
        await user.save();


        return {
            message: "Login successful",
            userId: user._id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            permissions: user.permissions,
            approvalStatus: user.approvalStatus,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        };
    },
};

export default authService;
