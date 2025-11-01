import rateLimit from "express-rate-limit";
import { type Application } from "express";

// ✅ Global API Rate Limit (all routes)
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 200, // 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
});

// ✅ Auth-specific limit (brute force protection)
export const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 10, // 10 login tries per 10 mins
    message: {
        success: false,
        message: "Too many login attempts, please try again later."
    },
    skipSuccessfulRequests: true, // ✅ login success won't count as attempt
});

// ✅ Helper to attach globally
export function registerRateLimit(app: Application) {
    app.use("/api", apiRateLimiter);
}
