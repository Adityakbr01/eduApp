import { userService } from "src/services/index.js";
import { ApiResponder } from "src/utils/ApiResponder.js";
import { wrapAsync } from "src/utils/wrapAsync.js";

const userController = {
    //Adding pagination now
    getAllUsers: wrapAsync(async (req, res) => {
        const result = await userService.getAllUsers(req.query);
        ApiResponder.success(res, 200, result.message, {
            users: result.users,
            pagination: result.pagination
        }, {
            pagination: result.pagination
        });
    }),
    getUserById: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.getUserById(userId);
        ApiResponder.success(res, 200, "User fetched successfully", {
            user: result.user,
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
        const deleteBy = req.user!.id;
        const result = await userService.deleteUserById(userId, deleteBy);
        ApiResponder.success(res, 200, result.message, result.data);
    }),

    // Roles and Permissions
    getRolesAndPermissions: wrapAsync(async (req, res) => {
        const result = await userService.getRolesAndPermissions();
        ApiResponder.success(res, 200, "Roles and permissions fetched successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    assignPermissions: wrapAsync(async (req, res) => {
        const assignBy = req.user!.id;
        const result = await userService.assignPermissions({ ...req.body }, assignBy);
        ApiResponder.success(res, 200, "Permissions assigned successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    deletePermissions: wrapAsync(async (req, res) => {
        const deleteBy = req.user!.id;
        const result = await userService.deletePermissions({ ...req.body }, deleteBy);
        ApiResponder.success(res, 200, "Permissions deleted successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    approveUser: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.approveUser(userId, req.user!.id);
        ApiResponder.success(res, 200, "User approved successfully", {
            message: result.message,
            data: result.data,
        });
    }),
    banUser: wrapAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.banUser(userId, req.user!.id);
        ApiResponder.success(res, 200, result.message, result.data);
    }),
};

export default userController;