import { Redis } from "ioredis";
import logger from "src/helpers/logger.js";

const redisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,   // ✅ BullMQ requirement
    enableReadyCheck: false,      // ✅ Upstash recommended
    tls: {}
});

// Logs for development
redisClient.on("connect", () => logger.info("✅ Redis connected"));
redisClient.on("error", (err) => logger.error("❌ Redis error:", err));

// ✅ Graceful shutdown
export async function closeRedis() {
    try {
        logger.info("⏳ Closing Redis connection...");
        await redisClient.quit();
        logger.info("✅ Redis connection closed");
    } catch (err) {
        logger.error("❌ Error closing Redis:", err);
    }
}

export default redisClient;

