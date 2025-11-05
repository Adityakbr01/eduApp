import { accessTokenCookieOptions, refreshTokenCookieOptions } from "src/configs/cookie.js";
import { authService } from "src/services/index.js";
import { ApiResponder } from "src/utils/ApiResponder.js";
import { wrapAsync } from "src/utils/wrapAsync.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";

const authController = {
    registerUser: wrapAsync(async (req, res) => {
        const body = req.body as RegisterSchemaInput;
        const result = await authService.registerUserService(body);
        ApiResponder.success(res, 201, "User registered successfully", result);
    }),
    sendRegisterOtp: wrapAsync(async (req, res) => {
        const { email } = req.body;
        const result = await authService.sendRegisterOtpService(email);
        ApiResponder.success(res, 200, "OTP sent successfully", result);
    }),
    verifyRegisterOtp: wrapAsync(async (req, res) => {
        const { email, otp } = req.body;
        const result = await authService.verifyRegisterOtpService(email, otp);
        ApiResponder.success(res, 200, "User verified successfully", result);
    }),
    loginUser: wrapAsync(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.loginUserService(email, password);
        res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);
        res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
        ApiResponder.success(res, 200, "User logged in successfully", {
            userId: result.userId,
            email: result.email,
            role: result.role,
            isEmailVerified: result.isEmailVerified,
            permissions: result.permissions,
            approvalStatus: result.approvalStatus,
            accessToken: result.accessToken,
        });
    }),
    sendResetPassOtp: wrapAsync(async (req, res) => {
        const { email } = req.body;
        const result = await authService.sendResetPassOtpService(email);
        ApiResponder.success(res, 200, "Password reset otp sent to email", {
            email: result.email,
            message: result.message
        });
    }),
    verifyResetPassOtp: wrapAsync(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const result = await authService.verifyResetPassOtpService(email, otp, newPassword);
        ApiResponder.success(res, 200, "Password reset success", {
            email: result.email,
            message: result.message
        })
    }),
    changePassword: wrapAsync(async (req, res) => {
        const userId = req.user!.id!;
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePasswordService(userId, currentPassword, newPassword);
        ApiResponder.success(res, 200, "Password changed successfully", result);
    }),
    refreshToken: wrapAsync(async (req, res) => {
        const refreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"] || req.body.refreshToken;
        const result = await authService.refreshTokenService(refreshToken);
        res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
        ApiResponder.success(res, 200, "Token refreshed successfully", {
            accessToken: result.accessToken,
        });
    }),
    logoutUser: wrapAsync(async (req, res) => {
        const refreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"] || req.body.refreshToken;
        await authService.logoutUserService(refreshToken);
        res.clearCookie("refreshToken", refreshTokenCookieOptions);
        res.clearCookie("accessToken", accessTokenCookieOptions);
        ApiResponder.success(res, 200, "User logged out successfully");
    }),
    getCurrentUser: wrapAsync(async (req, res) => {
        const result = await authService.getCurrentUserService(req);
        ApiResponder.success(res, 200, "Current user fetched successfully", result);
    }),
};

export default authController;
