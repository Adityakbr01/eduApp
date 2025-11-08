import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { morganLogger } from "./morganLogger.js";
import { requestId } from "./requestId.js";
import { securityHeaders } from "../security/securityHeaders.js";
import { requestLogger } from "./requestLogger.js";
import _config from "src/configs/_config.js";



const allowedOrigins = [
    _config.CLIENT_URL,            // production frontend
    "http://localhost:3000",       // local dev
    "http://127.0.0.1:3000",
];

export function defaultMiddlewares(app: express.Application) {
    app.use(requestId);
    app.use(securityHeaders);

    app.use(helmet());
    app.use(express.static("public"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);

                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                } else {
                    return callback(new Error("Not allowed by CORS"));
                }
            },
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        })
    );

    app.use(compression());
    app.use(requestLogger);

    morganLogger(app);
}
