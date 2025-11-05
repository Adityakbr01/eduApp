import { ROLES } from "src/constants/roles.js";
import User from "src/models/user.model.js";
import { ApiError } from "src/utils/apiError.js";
import { generateOtp } from "src/utils/generateOtp.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";
import emailService, { EmailType } from "./otp.service.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import jwt from "jsonwebtoken"
import _config from "src/configs/_config.js";
//Todo  --> implement store opt in hashed password if db leak than protects it

const authService = {
    registerUserService: async (data: RegisterSchemaInput) => {
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
    sendRegisterOtpService: async (email: string) => {
        const user = await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry");

        CheckUserEmailAndBanned(user)

        const { otp, expiry } = generateOtp();

        user.verifyOtp = otp;
        user.verifyOtpExpiry = expiry;
        await user.save();
        await emailService.sendEmail(EmailType.VERIFY_OTP, {
            email: user.email,
            otp,
        });
    },
    verifyRegisterOtpService: async (email: string, otp: string) => {
        const user = await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry");

        CheckUserEmailAndBanned(user)


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
    loginUserService: async (email: string, password: string) => {
        const user = await User.findOne({ email }).select("+password");

        CheckUserEmailAndBanned(user)

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
    sendResetPassOtpService: async (email: string) => {
        const user = await User.findOne({ email });
        CheckUserEmailAndBanned(user)

        const { otp, expiry } = generateOtp();

        user.verifyOtp = otp;
        user.verifyOtpExpiry = expiry;
        await user.save();
        await emailService.sendEmail(EmailType.PASSWORD_RESET_OTP, {
            email: user.email,
            otp,
        });

        return {
            message: "Password reset otp sent successfully",
            userId: user._id,
            email: user.email,
            role: user.role,
        };

    },
    verifyResetPassOtpService: async (email: string, otp: string, newPassword: string) => {
        const user = await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry +password");

        CheckUserEmailAndBanned(user)


        if (String(user.verifyOtp) !== String(otp) || !user.verifyOtpExpiry || user.verifyOtpExpiry < new Date()) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "Invalid or expired OTP" }],
            });
        }

        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.password = newPassword
        await user.save();

        return {
            message: "Password reset successfully",
            userId: user._id,
            email: user.email,
            role: user.role,
        };
    },
    changePasswordService: async (userId: string, currentPassword: string, newPassword: string) => {
        const user = await User.findById(userId).select("+password");
        CheckUserEmailAndBanned(user)

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new ApiError({
                statusCode: 400,
                message: "Current password is incorrect",
                errors: [{ path: "currentPassword", message: "Current password is incorrect" }],
            });
        }
        user.password = newPassword;
        await user.save();
        return {
            message: "Password changed successfully",
            userId: user._id,
            email: user.email,
            role: user.role,
        };
    },
    refreshTokenService: async (refreshToken: string) => {
        if (!refreshToken) {
            throw new ApiError({
                statusCode: 401,
                message: "Refresh token missing",
            });
        }
        const user = jwt.verify(refreshToken, _config.JWT_REFRESH_TOKEN_SECRET!) as { userId: string };
        if (!user) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid refresh token",
            });
        }
        const foundUser = await User.findById(user.userId).select("+refreshToken +accessToken");

        if (!foundUser) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        CheckUserEmailAndBanned(foundUser);
        const newAccessToken = foundUser.generateAccessToken();
        foundUser.accessToken = newAccessToken;
        await foundUser.save();
        return {
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        };
    },
    logoutUserService: async (refreshToken: string) => {
        if (!refreshToken) {
            throw new ApiError({
                statusCode: 401,
                message: "Refresh token missing",
            });
        } const user = jwt.verify(refreshToken, _config.JWT_REFRESH_TOKEN_SECRET!) as { userId: string };
        if (!user) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid refresh token",
            });
        }
        const foundUser = await User.findById(user.userId).select("+refreshToken +accessToken");

        if (!foundUser) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }
        CheckUserEmailAndBanned(foundUser);

        foundUser.refreshToken = undefined;
        foundUser.accessToken = undefined;
        await foundUser.save();
    },
    getCurrentUserService: async (userId: string) => {
        const user = await User.findById(userId).select("-password -verifyOtp -verifyOtpExpiry -refreshToken -accessToken");
        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }
        return {
            message: "Current user fetched successfully",
            user,
        };
    }
};

export default authService;
