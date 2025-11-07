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
        console.log("⏳ Closing Redis connection...");
        await redisClient.quit();
        console.log("✅ Redis connection closed");
    } catch (err) {
        console.error("❌ Error closing Redis:", err);
    }
}

export default redisClient;

