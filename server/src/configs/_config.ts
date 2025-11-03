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
    JWT_ACCESS_TOKEN_SECRET: zod.string().min(1).default("your_access_token_secret"),
    JWT_REFRESH_TOKEN_SECRET: zod.string().min(1).default("your_refresh_token_secret"),
    JWT_ACCESS_TOKEN_EXPIRES_IN: zod.string().default("15m"),
    JWT_REFRESH_TOKEN_EXPIRES_IN: zod.string().default("7d"),
    JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS: zod.number().default(604800), // 7 days
    JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS: zod.number().default(900),  // 15 minutes
    BCRYPT_SALT_ROUNDS: zod.number().min(1).default(10),
    SERVER_BASE_URL: zod.string().url().default("http://localhost:3000"),
    SMTP_PASS: zod.string().min(1).default("your_smtp_password"),
    SMTP_USER: zod.string().min(1).default("your_smtp_user"),
    UPSTASH_REDIS_URL: zod.string().min(1).default("your_upstash_redis_url"),
    BULLMQ_WORKER_CONCURRENCY: zod.number().min(1).default(5),
    CLOUDINARY_CLOUD_NAME: zod.string().min(1).default("your_cloud_name"),
    CLOUDINARY_API_KEY: zod.string().min(1).default("your_api_key"),
    CLOUDINARY_API_SECRET: zod.string().min(1).default("your_api_secret"),
})

// Parse and validate environment variables
const parsedConfig = configSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    MONGO_URI: process.env.MONGO_URI,
    LOG_DIR: process.env.LOG_DIR,
    CLIENT_URL: process.env.CLIENT_URL,
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS),
    JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS),
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
    SERVER_BASE_URL: process.env.SERVER_BASE_URL,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_USER: process.env.SMTP_USER,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    BULLMQ_WORKER_CONCURRENCY: Number(process.env.BULLMQ_WORKER_CONCURRENCY),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
})


//
if (!parsedConfig.success) {
    console.error("Invalid configuration:", parsedConfig.error);
    process.exit(1);
}

const _config = parsedConfig.data;

export default _config;