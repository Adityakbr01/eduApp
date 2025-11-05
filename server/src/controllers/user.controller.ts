import { userService } from "src/services/index.js";
import { ApiResponder } from "src/utils/ApiResponder.js";
import { wrapAsync } from "src/utils/wrapAsync.js";
import type { AssignRoleSchemaInput } from "src/validators/user.Schema.js";

const userController = {
    getAllUsers: wrapAsync(async (req, res) => {
        const result = await userService.getAllUsers();
        ApiResponder.success(res, 200, "Users fetched successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    getUserById: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.getUserById(userId);
        ApiResponder.success(res, 200, "User fetched successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    updateUserById: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.updateUserById(userId, req.body);
        ApiResponder.success(res, 200, "User updated successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    deleteUserById: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.deleteUserById(userId);
        ApiResponder.success(res, 200, "User deleted successfully", {
            message: result.message,
            data: result.data,
        });
    }),

    // Roles and Permissions
    getRolesAndPermissions: wrapAsync(async (req, res) => {
        const result = await userService.getRolesAndPermissions();
        ApiResponder.success(res, 200, "Roles and permissions fetched successfully", {
            message: result.message,
            data: result.data,
        });
    }),
};

export default userController;