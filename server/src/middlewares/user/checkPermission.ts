import type { NextFunction, Request, Response } from "express";
import { ApiError } from "src/utils/apiError.js";

export const checkPermission = (permission: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user?.permissions?.includes(permission)) {
            throw new ApiError({ statusCode: 403, message: "Permission Denied" });
        }
        next();
    };
};
