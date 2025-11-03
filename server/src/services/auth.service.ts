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
};

export default authService;
