import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { morganLogger } from "./morganLogger.js";
import { requestId } from "./requestId.js";
import { securityHeaders } from "../security/securityHeaders.js";

export function defaultMiddlewares(app: express.Application) {
    app.use(requestId);
    app.use(securityHeaders);

    app.use(helmet());
    app.use(express.static("public"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    //todo: update cors origin
    app.use(cors({ origin: "*", credentials: true }));
    app.use(compression());
    morganLogger(app);
}
