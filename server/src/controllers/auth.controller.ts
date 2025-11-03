import logger from "src/helpers/logger.js";
import { authService } from "src/services/index.js";
import { ApiResponder } from "src/utils/ApiResponder.js";
import { wrapAsync } from "src/utils/wrapAsync.js";
import type { RegisterSchemaInput } from "src/validators/user.Schema.js";

const authController = {
    registerUser: wrapAsync(async (req, res) => {
        logger.info(req.body);
        const body = req.body as RegisterSchemaInput;
        const result = await authService.registerUser(body);
        ApiResponder.success(res, 201, "User registered successfully", result);
    }),
};

export default authController;
