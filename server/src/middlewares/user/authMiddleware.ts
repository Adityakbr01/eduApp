import jwt from "jsonwebtoken";
import { ApiError } from "src/utils/apiError.js";
import { getUserPermissions } from "./getUserPermissions.js";
import type { JwtPayload } from "jsonwebtoken";
import type { NextFunction } from "express";
import _config from "src/configs/_config.js";
import type { Request, Response } from "express";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) throw new ApiError({ statusCode: 401, message: "Unauthorized" });

        const decoded = jwt.verify(token, _config.JWT_ACCESS_TOKEN_SECRET) as JwtPayload;
        console.log("Auth Middleware Decoded:", decoded);
        const RolePermissions = await getUserPermissions(decoded.userId);

        req.user = {
            id: decoded.userId,
            role: decoded.role,
            RolePermissions: RolePermissions,
            permissions: decoded.permissions,
        };

        next();
    } catch (err) {
        next(new ApiError({ statusCode: 401, message: "Unauthorized" }));
    }
};
export default authMiddleware;