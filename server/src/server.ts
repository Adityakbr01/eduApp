import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import _config from "configs/_config.js";
import logger from "helpers/logger.js";

import { connectToDatabase, disconnectFromDatabase } from "db/database.js";
import { closeRedis } from "configs/redisClient.js";

import { startWorkers, stopWorkers } from "src/bull/index.js"; 

const port = _config.port;
const HOST =
    _config.NODE_ENV === "development"
        ? `http://localhost:${_config.port}`
        : _config.CLIENT_URL;

let server = null;

async function startServer() {
    try {
        logger.info("🚀 Starting server...");

        await connectToDatabase();
        logger.info("✅ MongoDB connected");

        // ✅ Start BullMQ Workers automatically
        startWorkers();
        logger.info("✅ All workers active");

        server = app.listen(port, () => {
            logger.info(`🚀 Server running at: ${HOST}`);
        });
    } catch (err) {
        logger.error("❌ Server startup error:", err);
        await disconnectFromDatabase();
        await closeRedis();
        process.exit(1);
    }
}

startServer();

// ✅ Graceful Shutdown
async function gracefulShutdown(signal) {
    logger.warn(`⏳ Received ${signal}, shutting down gracefully...`);

    if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
        logger.info("✅ HTTP server closed");
    }

    // ✅ Stop workers FIRST
    await stopWorkers();

    // ✅ Then disconnect Redis and DB
    await disconnectFromDatabase();
    await closeRedis();

    process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
