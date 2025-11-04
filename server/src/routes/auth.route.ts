import { Router } from "express";
import { authController } from "src/controllers/index.js"
import { validateSchema } from "src/middlewares/custom/validateSchema.js";
import { loginSchema, registerOtpSchema, registerSchema, verifyOtpSchema } from "src/validators/index.js";
import { authRateLimiter } from "src/middlewares/index.js";
const router = Router();

router.post("/register", validateSchema(registerSchema), authController.registerUser);
router.post("/register/send-otp", authRateLimiter, validateSchema(registerOtpSchema), authController.sendRegisterOtp);
router.post("/register/verify-otp", authRateLimiter, validateSchema(verifyOtpSchema), authController.verifyRegisterOtp);
router.post("/login", authRateLimiter, validateSchema(loginSchema), authController.loginUser);

export default router;
