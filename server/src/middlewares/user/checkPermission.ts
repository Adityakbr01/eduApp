import type { NextFunction, Request, Response } from "express";
import { ApiError } from "src/utils/apiError.js";

const checkPermission = (permission: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new ApiError({ statusCode: 401, message: "Login required" });
        }

        if (!req.user.permissions?.includes(permission)) {
            console.warn(`Denied: User ${req.user.id} missing permission: ${permission}`);
            throw new ApiError({ statusCode: 403, message: "Permission Denied" });
        }

        next();
    };
};
export default checkPermission;