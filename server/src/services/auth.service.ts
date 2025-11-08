import jwt from "jsonwebtoken";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob, EMAIL_JOB_Names } from "src/bull/workers/email.worker.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import _config from "src/configs/_config.js";
import { ROLES } from "src/constants/roles.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import { RoleModel } from "src/models/RoleAndPermissions/role.model.js";
import User from "src/models/user.model.js";
import { ApiError } from "src/utils/apiError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";
import { sessionService } from "./index.js";
import logger from "src/helpers/logger.js";

const USER_CACHE_TTL = TTL.USER_PROFILE;

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

        // Invalidate any stale cache for this user id (safe no-op if not present)
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            // non-fatal: don't fail registration due to cache issues
            logger.warn("cache.del failed during registerUserService:", err);
        }

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

        // optional: invalidate cached user view when OTP/state changes
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during sendRegisterOtpService:", err);
        }
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

        // invalidate cached user after email verification
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during verifyRegisterOtpService:", err);
        }

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email
        };
    },
    loginUserService: async (email: string, password: string) => {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "email", message: "Account does not exist" }],
            });
        }

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


        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        try {
            await sessionService.createSession(String(user._id), refreshToken);
        } catch (err) {
            logger.error("Failed to create session in Redis:", err);
            throw new ApiError({
                statusCode: 500,
                message: "Failed to create session. Please try again.",
            });
        }

        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during loginUserService:", err);
        }

        return {
            message: "Login successful",
            userId: user._id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            permissions: user.permissions,
            approvalStatus: user.approvalStatus,
            accessToken,
            refreshToken,
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

        // invalidate cached user (safe no-op)
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during sendResetPassOtpService:", err);
        }

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

        // Invalidate session after password reset (security measure)
        try {
            await sessionService.deleteSession(String(user._id));
        } catch (err) {
            logger.error("Failed to delete session after password reset:", err);
        }

        // Invalidate cached user after password reset
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during verifyResetPassOtpService:", err);
        }

        return {
            message: "Password reset successfully. Please login with your new password.",
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

        // Invalidate session when password changes (security best practice)
        try {
            await sessionService.deleteSession(userId);
        } catch (err) {
            logger.error("Failed to delete session after password change:", err);
        }

        // Invalidate cached user after password change
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(user._id)));
        } catch (err) {
            logger.warn("cache.del failed during changePasswordService:", err);
        }

        return {
            message: "Password changed successfully. Please login again.",
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

        // Step 1: Verify JWT signature (stateless)
        let decoded: { userId: string };
        try {
            decoded = jwt.verify(
                refreshToken,
                _config.JWT_REFRESH_TOKEN_SECRET!
            ) as { userId: string };
        } catch (err) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid or expired refresh token",
            });
        }

        if (!decoded?.userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid refresh token",
            });
        }


        const sessionIsValid = await sessionService.validateSession(decoded.userId, refreshToken);

        if (!sessionIsValid) {
            throw new ApiError({
                statusCode: 401,
                message: "Session expired or logged in on another device. Please login again.",
            });
        }

        const foundUser = await User.findById(decoded.userId);

        if (!foundUser) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        CheckUserEmailAndBanned(foundUser);

        const newAccessToken = foundUser.generateAccessToken();

        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(foundUser._id)));
        } catch (err) {
            logger.warn("cache.del failed during refreshTokenService:", err);
        }

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
        }

        // Verify JWT signature
        let decoded: { userId: string };
        try {
            decoded = jwt.verify(refreshToken, _config.JWT_REFRESH_TOKEN_SECRET!) as { userId: string };
        } catch (err) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid refresh token",
            });
        }

        if (!decoded || !decoded.userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid refresh token",
            });
        }

        const foundUser = (await User.findById(decoded.userId).select("+refreshToken +accessToken")) as any;

        if (!foundUser) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        CheckUserEmailAndBanned(foundUser);

        // Delete session from Redis - enforce single device logout
        try {
            await sessionService.deleteSession(decoded.userId);
        } catch (err) {
            logger.error("Failed to delete session from Redis:", err);
            // Continue logout even if Redis fails
        }

        // Invalidate user cache after logout
        try {
            await cacheManager.del(cacheKeyFactory.user.byId(String(foundUser._id)));
        } catch (err) {
            logger.warn("cache.del failed during logoutUserService:", err);
        }
    },
    getCurrentUserService: async (req: any) => {
        const userId = req.user.id;
        const cacheKey = cacheKeyFactory.user.byId(String(userId));

        // Try cache-aside: return cached value when present
        try {
            const cached = await cacheManager.get(cacheKey);
            if (cached) {
                return {
                    message: "Current user fetched successfully (cache)",
                    user: cached,
                };
            }
        } catch (err) {
            // non-fatal: if cache fails, continue to DB
            logger.warn("cache.get failed in getCurrentUserService:", err);
        }

        const user = await User.findById(userId)
            .select("-password -verifyOtp -verifyOtpExpiry -refreshToken -accessToken")
            .populate("roleId")
            .lean();

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const responseUser = {
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
        };

        // Populate cache for future requests (best-effort)
        try {
            await cacheManager.set(cacheKey, responseUser, USER_CACHE_TTL);
        } catch (err) {
            logger.warn("cache.set failed in getCurrentUserService:", err);
        }

        return {
            message: "Current user fetched successfully",
            user: responseUser,
        };
    }
};

export default authService;
