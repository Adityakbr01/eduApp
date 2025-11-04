import type { Request, Response, NextFunction } from "express";
import logger from "src/helpers/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info({
            message: "Incoming Request",
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            //@ts-ignore
            requestId: req.requestId!, // if you're attaching it somewhere
            ip: req.ip,
            params: req.params,
            query: req.query,
            body: req.method !== "GET" ? req.body : undefined, // avoid logging GET body noise
        });
    });

    next();
}
