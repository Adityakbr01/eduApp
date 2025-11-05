import type { NextFunction } from "express";
import { ApiError } from "src/utils/apiError.js";
import type { Request, Response } from "express";
import { ROLES } from "src/constants/roles.js";

const checkRole = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return next(
                new ApiError({
                    statusCode: 401,
                    message: "Unauthorized — No user role found. Please login again.",
                })
            );
        }

        // ✅ Admin Bypass Logic
        if (userRole === ROLES.ADMIN) {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return next(
                new ApiError({
                    statusCode: 403,
                    message: `Access denied — Role '${userRole}' is not permitted.`,
                })
            );
        }

        next();
    };
};

export default checkRole;
