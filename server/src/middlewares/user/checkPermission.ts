import type { NextFunction, Request, Response } from "express";
import { ApiError } from "src/utils/apiError.js";

const checkPermission = (permission: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return next(new ApiError({ statusCode: 401, message: "Login required" }));
        }

        if (!user.permissions || !user.permissions.includes(permission)) {
            console.warn(
                `Permission Denied: User ${user.id ?? "unknown"} | Missing: ${permission}`
            );

            return next(new ApiError({ statusCode: 403, message: "Permission Denied" }));
        }

        next();
    };
};

export default checkPermission;
