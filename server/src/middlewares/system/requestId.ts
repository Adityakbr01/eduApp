import { v4 as uuid } from "uuid";
import { type Request, type Response, type NextFunction } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
    const id = uuid();

    req.requestId = id;   // ✅ safe custom field
    res.setHeader("X-Request-ID", id);

    next();
}
