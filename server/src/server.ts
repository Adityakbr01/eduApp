import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import _config from "configs/_config.js";
import logger from "helpers/logger.js";
import { connectToDatabase, disconnectFromDatabase } from "db/database.js";

const port = _config.port;
const HOST = _config.NODE_ENV === "development" ? `http://localhost:${_config.port}` : _config.CLIENT_URL;


async function startServer() {
    try {
        await connectToDatabase();
        app.listen(port, () => {
            logger.info(`🚀 Server running at port: ${port}`);
            logger.info(`🌱 Environment: ${_config.NODE_ENV}`);
            logger.info(`🌐 Host: ${HOST}`);
        });
    } catch (err) {
        logger.error("❌ Server startup error:", err);
        await disconnectFromDatabase();
        process.exit(1);
    }
}

startServer();

process.on("SIGINT", async () => {
    logger.warn("⏳ SIGINT received. Shutting down...");
    await disconnectFromDatabase();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    logger.warn("⏳ SIGTERM received. Shutting down...");
    await disconnectFromDatabase();
    process.exit(0);
});
