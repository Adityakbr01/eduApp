import type { NextFunction } from "express";
import { ApiError } from "src/utils/apiError.js";
import type { Request, Response } from "express";

const checkRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.roles?.some(r => roles.includes(r))) {
            throw new ApiError({ statusCode: 403, message: "Forbidden" });
        }
        next();
    }
};



export default checkRole;