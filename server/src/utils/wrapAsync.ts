import type { NextFunction, Request, RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";

type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export const wrapAsync = (fn: AsyncRouteHandler): RequestHandler => {
    return asyncHandler(fn);
};