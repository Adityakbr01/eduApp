import dotenv from 'dotenv';
dotenv.config();
import zod from "zod";




// Define the configuration schema
const configSchema = zod.object({
    NODE_ENV: zod.enum(["development", "production", "test"]).default("development"),
    port: zod.number().min(1).max(65535).default(3000),
    MONGO_URI: zod.string().min(5).default("mongodb://localhost:27017/eduApp"),
    LOG_DIR: zod.string().min(1).default("./logs"),
    CLIENT_URL: zod.string().url().optional(), // ✅ Allow prod host
})


// Parse and validate environment variables
const parsedConfig = configSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    MONGO_URI: process.env.MONGO_URI,
    LOG_DIR: process.env.LOG_DIR,
    CLIENT_URL: process.env.CLIENT_URL,
})


//
if (!parsedConfig.success) {
    console.error("Invalid configuration:", parsedConfig.error);
    process.exit(1);
}

const _config = parsedConfig.data;

export default _config;