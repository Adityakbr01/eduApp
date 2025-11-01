import { type Request, type Response, type NextFunction } from "express";

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
    res.setHeader("X-Powered-By", "CompleteStack"); // custom branding
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
    next();
}
