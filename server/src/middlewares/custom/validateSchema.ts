/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "src/utils/apiError.js";
import { ZodError, ZodType } from "zod";
export const validateSchema
    = (
        schema: ZodType<any, any, any>
    ): RequestHandler => {
        return (req: Request, _res: Response, next: NextFunction): void => {
            try {
                const requestData = {
                    ...req.body,
                    ...((req as any).files || {}),
                    ...req.query
                };

                if (!requestData || Object.keys(requestData).length === 0) {
                    // Throw error to be handled by global handler
                    throw new ApiError({ message: "Request body is missing", statusCode: 400 });
                }

                const parsedData = schema.parse(requestData);

                // Attach parsed data to req for controller
                req.body = parsedData;

                next();
            } catch (err: unknown) {
                if (err instanceof ZodError) {
                    next(err);
                } else if (err instanceof ApiError) {
                    next(err); // Already an ApiError, forward as is
                } else {
                    next(new ApiError({ message: "Unexpected error during validation", statusCode: 400 }));
                }
            }
        };
    };