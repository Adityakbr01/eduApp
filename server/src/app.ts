import express from "express";
import { defaultMiddlewares, registerRateLimit } from "./middlewares/index.js";
import router from "./routes/index.js";
const app = express();


// Setup global middlewares
defaultMiddlewares(app);
registerRateLimit(app);

// Setup routes
app.use("/api/v1/",router)


//Todo add 404 and error handler
export default app;
