import type { NextFunction } from "express";
import { ApiError } from "src/utils/apiError.js";
import type { Request, Response } from "express";

const checkRole = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            return next(new ApiError({ statusCode: 403, message: "Forbidden" }));
        }

        next();
    };
};

export default checkRole;
