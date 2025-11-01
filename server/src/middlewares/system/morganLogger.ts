import { type Application } from "express";
import morgan from "morgan";
import logger from "src/helpers/logger.js";

export function morganLogger(app: Application) {
    app.use(morgan("tiny", {
        stream: {
            write: (message: string) => logger.http(message.trim())
        }
    }))
}
