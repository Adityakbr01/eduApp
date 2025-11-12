import jwt from "jsonwebtoken";
import { ApiError } from "src/utils/apiError.js";
import type { JwtPayload } from "jsonwebtoken";
import type { NextFunction } from "express";
import _config from "src/configs/_config.js";
import type { Request, Response } from "express";
import { getUserPermissions } from "./getUserPermissions.js";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Try to get token from Authorization header first, then fall back to cookies
        let token = req.cookies.accessToken;
        let refreshToken = req.cookies.refreshToken;

        // If not in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }

        if (!refreshToken) {
            const refreshAuthHeader = req.headers["x-refresh-token"];
            if (refreshAuthHeader && typeof refreshAuthHeader === "string") {
                refreshToken = refreshAuthHeader;
            }
        }
        //check refresh token to redis for single device login
        if (refreshToken) {
            const decodedRefresh = jwt.verify(refreshToken, _config.JWT_REFRESH_TOKEN_SECRET) as JwtPayload;
            const { sessionService } = await import("src/services/index.js");
            const isValidSession = await sessionService.validateSession(decodedRefresh.userId, refreshToken);
            if (!isValidSession) {
                throw new ApiError({ statusCode: 401, message: "Invalid session" });
            }
        }


        if (!token) throw new ApiError({ statusCode: 401, message: "Unauthorized - No token provided" });

        const decoded = jwt.verify(token, _config.JWT_ACCESS_TOKEN_SECRET) as JwtPayload;


        const rolePermissions = await getUserPermissions(decoded.roleId);

        req.user = {
            id: decoded.userId,
            role: rolePermissions.role,
            permissions: [...rolePermissions.permissions, ...(decoded.permissions || [])],
            roleId: decoded.roleId,
        };

        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return next(new ApiError({ statusCode: 401, message: "Token expired" }));
        }

        return next(new ApiError({ statusCode: 401, message: "Invalid token" }));
    }
};
export default authMiddleware;