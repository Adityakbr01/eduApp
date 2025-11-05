import type { NextFunction, Request, Response } from "express";
import logger from "src/helpers/logger.js";
import { ApiError } from "src/utils/apiError.js";
import { getUserPermissions } from "./getUserPermissions.js";

const checkPermission = (permission: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return next(new ApiError({ statusCode: 401, message: "Login required" }));
        }


        const rbacPermissions = await getUserPermissions(user.roleId)

        console.log("User Permissions:", user.permissions);

        if (!user.permissions || !user.permissions.includes(permission) || !rbacPermissions.includes(permission)) {
            logger.warn(
                `Permission Denied: User ${user.id ?? "unknown"} | Missing: ${permission}`
            );

            return next(new ApiError({ statusCode: 403, message: "Permission Denied" }));
        }

        next();
    };
};

export default checkPermission;
