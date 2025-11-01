import mongoose from "mongoose";
import _config from "configs/_config.js";
import logger from "../helpers/logger.js";

export async function connectToDatabase() {
    try {
        await mongoose.connect(_config.MONGO_URI);
        logger.info("✅ Connected to MongoDB");
    } catch (error) {
        logger.error("❌ MongoDB connection failed:", error);
        throw error;
    }
}

export async function disconnectFromDatabase() {
    try {
        await mongoose.disconnect();
        logger.info("🛑 MongoDB disconnected");
    } catch (error) {
        logger.error("❌ MongoDB disconnect error:", error);
    }
}
