import { accessTokenCookieOptions, refreshTokenCookieOptions } from "src/configs/cookie.js";
import logger from "src/helpers/logger.js";
import { authService } from "src/services/index.js";
import { ApiResponder } from "src/utils/ApiResponder.js";
import { wrapAsync } from "src/utils/wrapAsync.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";

const authController = {
    registerUser: wrapAsync(async (req, res) => {
        const body = req.body as RegisterSchemaInput;
        const result = await authService.registerUser(body);
        ApiResponder.success(res, 201, "User registered successfully", result);
    }),
    sendRegisterOtp: wrapAsync(async (req, res) => {
        const { email } = req.body;
        const result = await authService.sendRegisterOtp(email);
        ApiResponder.success(res, 200, "OTP sent successfully", result);
    }),
    verifyRegisterOtp: wrapAsync(async (req, res) => {
        const { email, otp } = req.body;
        const result = await authService.verifyRegisterOtp(email, otp);
        res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);
        res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
        ApiResponder.success(res, 200, "User verified successfully", result);
    }),
    loginUser: wrapAsync(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
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
};

export default authController;
