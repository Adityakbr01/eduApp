import auth from "./auth.route.js";
import { Router } from "express";
const router = Router();

router.use("/auth", auth);

export default router;
