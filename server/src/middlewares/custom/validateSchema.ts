import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, ZodType } from "zod";

export const validateSchema = (schema: ZodType<any>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                body: req.body,
                query: req.query,
                params: req.params,
                files: (req as any).files ?? null,
            };

            const parsed = schema.parse(data);

            (req as any).validated = parsed;

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return next(
                    err
                );
            }
            next(err);
        }
    };
};
