import express from "express";
import { defaultMiddlewares, registerRateLimit } from "./middlewares/index.js";
const app = express();


// Setup global middlewares
defaultMiddlewares(app);
registerRateLimit(app);


//Todo add 404 and error handler
export default app;
