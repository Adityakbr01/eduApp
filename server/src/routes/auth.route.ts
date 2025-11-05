import { Router } from "express";
import { authController } from "src/controllers/index.js"
import { validateSchema } from "src/middlewares/custom/validateSchema.js";
import { changePasswordSchema, loginSchema, registerOtpSchema, registerSchema, registerVerifyOtpSchema, verifyOtpSchema } from "src/validators/index.js";
import { authRateLimiter } from "src/middlewares/index.js";
import authMiddleware from "src/middlewares/user/authMiddleware.js";
const router = Router();

router.post("/register", validateSchema(registerSchema), authController.registerUser);
router.post("/register/send-otp", authRateLimiter, validateSchema(registerOtpSchema), authController.sendRegisterOtp);
router.post("/register/verify-otp", authRateLimiter, validateSchema(registerVerifyOtpSchema), authController.verifyRegisterOtp);
router.post("/login", authRateLimiter, validateSchema(loginSchema), authController.loginUser);
router.post("/reset-password/send-otp", authRateLimiter, validateSchema(registerOtpSchema), authController.sendResetPassOtp);
router.post("/reset-password/verify-otp", authRateLimiter, validateSchema(verifyOtpSchema), authController.verifyResetPassOtp);
router.post("/change-password", authRateLimiter, validateSchema(changePasswordSchema), authMiddleware, authController.changePassword);
router.post("/token-refresh", authController.refreshToken);
router.post("/logout", authRateLimiter, authMiddleware, authController.logoutUser);
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;
