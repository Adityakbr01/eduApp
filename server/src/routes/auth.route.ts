import { Router } from "express";
const router = Router();

router.post("/auth/register/admin", (req, res) => {
    res.send("Admin registered successfully");
});

router.post("/auth/register/manager", (req, res) => {
    res.send("Manager registered successfully");
});

router.post("/auth/register/instructor", (req, res) => {
    res.send("Instructor registered successfully");
});

router.post("/auth/register/support-team", (req, res) => {
    res.send("Support team member registered successfully");
});

router.post("/auth/register/student", (req, res) => {
    res.send("Student registered successfully");
});

router.post("/auth/verify/send-otp", (req, res) => {
    res.send("Verification OTP sent");
});

router.post("/auth/verify/otp", (req, res) => {
    res.send("User verified successfully");
});

export default router;
