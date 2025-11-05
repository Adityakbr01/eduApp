import auth from "./auth.route.js";
import user from "./user.route.js";
import { Router } from "express";
const router = Router();

router.use("/auth", auth);
router.use("/users", user);

export default router;
