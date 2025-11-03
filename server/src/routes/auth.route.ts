import { Router } from "express";
import { authController } from "src/controllers/index.js"
import { validateSchema } from "src/middlewares/custom/validateSchema.js";
import { registerSchema } from "src/validators/user.Schema.js";
const router = Router();

router.post("/register", validateSchema(registerSchema), authController.registerUser);
router.post("/verify/send-otp", (req, res) => {
    res.send("Verification OTP sent");
});

router.post("/verify/otp", (req, res) => {
    res.send("User verified successfully");
});

export default router;
