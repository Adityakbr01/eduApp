import express from "express";
import { defaultMiddlewares, registerRateLimit } from "./middlewares/index.js";
import router from "./routes/index.js";
import globalErrorHandler from "./middlewares/system/globalErrorHandler.js";
import bullBoardAdapter from "./bull/bullBoard.js";
import logger from "./helpers/logger.js";
import _config from "./configs/_config.js";
const app = express();


// Setup global middlewares
defaultMiddlewares(app);
registerRateLimit(app);

// Setup routes
app.use("/api/v1", router)
// Setup Bull Board with protection
app.use(
    "/admin/queues",
    (req, res, next) => {
        const path = req.path;

        // ✅ Allow static files
        if (path.startsWith("/static/")) {
            return next();
        }

        // ✅ Allow all internal API calls
        if (path.startsWith("/api/")) {
            return next();
        }
        // ✅ Allow queue operations
        if (path.startsWith("/queue/")) {
            return next();
        }

        // ✅ Protect only the dashboard ENTRY PAGE
        const key = req.query?.key;
        if (key !== _config.BULL_BOARD_PASSWORD) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        next();
    },
    bullBoardAdapter.getRouter()
);



//Todo add 404 and error handler
app.use(globalErrorHandler);
export default app;
