import jwt from "jsonwebtoken";
import { ApiError } from "src/utils/apiError.js";
// import { getUserPermissions } from "./getUserPermissions.js";
import type { JwtPayload } from "jsonwebtoken";
import type { NextFunction } from "express";
import _config from "src/configs/_config.js";
import type { Request, Response } from "express";
import { getUserPermissions } from "./getUserPermissions.js";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) throw new ApiError({ statusCode: 401, message: "Unauthorized" });

        const decoded = jwt.verify(token, _config.JWT_ACCESS_TOKEN_SECRET) as JwtPayload;

        const rolePermissions = await getUserPermissions(decoded.roleId);

        req.user = {
            id: decoded.userId,
            role: decoded.role,
            permissions: rolePermissions,
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