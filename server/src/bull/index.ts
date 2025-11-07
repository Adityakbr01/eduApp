import logger from "src/helpers/logger.js";
import { emailWorker } from "./workers/email.worker.js";

const ALL_WORKERS = [emailWorker];

export function startWorkers() {
    logger.info("⚙️ Starting BullMQ workers...");
    ALL_WORKERS.forEach(() => { });
    logger.info("✅ Workers started");
}

export async function stopWorkers() {
    console.log("⏳ Stopping workers...");

    try {
        for (const worker of ALL_WORKERS) {
            if (worker?.close) {
                await worker.close();
            }
        }
        console.log("✅ Workers stopped");
    } catch (err) {
        console.log("❌ Error stopping workers", err);
    }
}
