import jwt from "jsonwebtoken";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob, EMAIL_JOB_Names } from "src/bull/workers/email.worker.js";
import _config from "src/configs/_config.js";
import { ROLES } from "src/constants/roles.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import { RoleModel } from "src/models/RoleAndPermissions/role.model.js";
import User from "src/models/user.model.js";
import { ApiError } from "src/utils/apiError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";

const authService = {
    registerUserService: async (data: RegisterSchemaInput) => {

        const userAgg = await User.aggregate([
            { $match: { email: data.email } },
            {
                $project: {
                    email: 1,
                    isEmailVerified: 1,
                    isBanned: 1,
                    verifyOtp: 1,
                    verifyOtpExpiry: 1
                }
            }
        ]);

        const existingUser = userAgg[0];

        if (existingUser && existingUser.isEmailVerified && !existingUser.isBanned) {
            throw new ApiError({
                statusCode: 400,
                message: "Account already exists. Please login.",
            });
        }

        if (existingUser && existingUser.isBanned) {
            throw new ApiError({
                statusCode: 403,
                message: "Your account is banned",
            });
        }

        // OTP generate + hash
        const { otp, hashedOtp, expiry } = await generateOtp();

        if (existingUser && !existingUser.isEmailVerified) {
            await User.updateOne(
                { email: data.email },
                {
                    $set: {
                        verifyOtp: hashedOtp,
                        verifyOtpExpiry: expiry
                    }
                }
            );

            await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
                email: existingUser.email,
                otp
            });

            throw new ApiError({
                statusCode: 400,
                message: "Account already exists. Please verify OTP sent to your email.",
            });
        }

        const roleDoc = await RoleModel.findOne({ name: data.role });
        if (!roleDoc) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid role selected",
            });
        }

        const profileData: any = {};

        if (data.role === ROLES.INSTRUCTOR) {
            profileData.instructorProfile = data.instructorProfile;
            profileData.isInstructorApproved = false;
        }

        if (data.role === ROLES.MANAGER) {
            profileData.managerProfile = data.managerProfile;
            profileData.isManagerApproved = false;
        }

        if (data.role === ROLES.SUPPORT) {
            profileData.supportTeamProfile = data.supportTeamProfile;
            profileData.isSupportTeamApproved = false;
        }

        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password,
            roleId: roleDoc._id,
            phone: data.phone,
            address: data.address,
            verifyOtp: hashedOtp,
            verifyOtpExpiry: expiry,
            ...profileData,
        });

        await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
            email: user.email,
            otp,
        });

        return {
            message: "OTP sent to your email",
            userId: user._id,
            email: user.email,
        };
    },
    sendRegisterOtpService: async (email: string) => {
        const user = (await User.findOne({ email }).select("+verifyOtp +verifyOtpExpiry")) as any;


        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "email", message: "No account associated with this email" }],
            });
        }

        if (user.isEmailVerified) {
            CheckUserEmailAndBanned(user)
        }

        if (user.isEmailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email is already verified",
                errors: [{ path: "email", message: "Email is already verified" }],
            });
        }

        const { otp, hashedOtp, expiry } = await generateOtp();

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpiry = expiry;
        await user.save();

        await addEmailJob(emailQueue, EMAIL_JOB_Names.REGISTER_OTP, {
            email: user.email,
            otp,
        });
    },
    verifyRegisterOtpService: async (email: string, otp: string) => {
        const user = await User.findOne({ email }).select(
            "+verifyOtp +verifyOtpExpiry"
        ) as any;

        CheckUserEmailAndBanned(user);

        if (user.isEmailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email is already verified",
                errors: [{ path: "email", message: "Email is already verified" }]
            });
        }

        // Expiry check
        if (!user.verifyOtpExpiry || user.verifyOtpExpiry < new Date()) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "OTP expired" }]
            });
        }

        // Hash compare (actual OTP matching)
        const isValidOtp = await verifyOtpHash(otp, user.verifyOtp);
        if (!isValidOtp) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "Invalid OTP" }]
            });
        }

        // Mark verified
        user.isEmailVerified = true;
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.approvedBy = undefined;

        await user.save();

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email
        };
    },
    loginUserService: async (email: string, password: string) => {
        const user = (await User.findOne({ email }).select("+password"));

        if (!user.isEmailVerified) {
            throw new ApiError({
                statusCode: 403,
                message: "Email is not verified",
                errors: [{ path: "email", message: "Please verify your email before logging in" }],
            });

        }
        CheckUserEmailAndBanned(user);

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
            isEmailVerified: user.isEmailVerified,
            permissions: user.permissions,
            approvalStatus: user.approvalStatus,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        };
    },
    sendResetPassOtpService: async (email: string) => {
        const user = (await User.findOne({ email })) as any;
        CheckUserEmailAndBanned(user)

        const { otp, hashedOtp, expiry } = await generateOtp();

        user.verifyOtp = hashedOtp;
        user.verifyOtpExpiry = expiry;
        await user.save();
        await addEmailJob(emailQueue, EMAIL_JOB_Names.RESET_PASS_OTP, {
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
        const user = await User.findOne({ email }).select(
            "+verifyOtp +verifyOtpExpiry +password"
        ) as any;

        CheckUserEmailAndBanned(user);

        // Expiry check
        if (!user.verifyOtpExpiry || user.verifyOtpExpiry < new Date()) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "OTP expired" }]
            });
        }

        // Compare hashed OTP
        const isValidOtp = await verifyOtpHash(otp, user.verifyOtp);
        if (!isValidOtp) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid or expired OTP",
                errors: [{ path: "otp", message: "Invalid OTP" }]
            });
        }

        // Update password (mongoose pre-save hook will hash)
        user.password = newPassword;
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;

        await user.save();

        return {
            message: "Password reset successfully",
            userId: user._id,
            email: user.email,
            role: user.role
        };
    },
    changePasswordService: async (userId: string, currentPassword: string, newPassword: string) => {
        const user = (await User.findById(userId).select("+password")) as any;
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
        const foundUser = (await User.findById(user.userId).select("+refreshToken +accessToken")) as any;

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
        const foundUser = (await User.findById(user.userId).select("+refreshToken +accessToken")) as any;

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
    getCurrentUserService: async (req: any) => {
        const user = await User.findById(req.user.id)
            .select("-password -verifyOtp -verifyOtpExpiry -refreshToken -accessToken")
            .populate("roleId")
            .lean();

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found"
            });
        }

        return {
            message: "Current user fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                roleId: user.roleId?._id,
                roleName: (user.roleId as any)?.name,
                isEmailVerified: user.isEmailVerified,
                approvalStatus: user.approvalStatus,
                isBanned: user.isBanned,
                permissions: req.user.permissions,
                phone: user.phone,
                address: user.address,
            }
        };
    }
};

export default authService;
