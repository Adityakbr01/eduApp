import { Role } from "src/models/RoleAndPermissions/role.model.js";
import { RolePermissionModel } from "src/models/RoleAndPermissions/rolePermission.model.js";
import User from "src/models/user.model.js";
import { ApiError } from "src/utils/apiError.js";

const userService = {
    getAllUsers: async () => {
        const users = await User.find().exec();
        if (!users) {
            throw new ApiError({
                statusCode: 404, message: "No users found", errors: [
                    { path: "users", message: "No user records exist in the database" }
                ]
            });
        }
        return {
            message: "Users fetched successfully",
            data: users,
        };
    },
    getUserById: async (userId: string) => {
        const user = await User.findById(userId).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404, message: "User not found", errors: [
                    { path: "user", message: "No user found with the given ID" }
                ]
            })
        }
        return {
            message: "User fetched successfully",
            data: user,
        };
    },
    updateUserById: async (userId: string, updateData: Partial<typeof User>) => {
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404, message: "User not found", errors: [
                    { path: "user", message: "No user found with the given ID" }
                ]
            });
        }
        return {
            message: "User updated successfully",
            data: user,
        };
    },
    deleteUserById: async (userId: string) => {
        const user = await User.findByIdAndDelete(userId).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404, message: "User not found", errors: [
                    { path: "user", message: "No user found with the given ID" }
                ]
            });
        }
        return {
            message: "User deleted successfully",
            data: user,
        };
    },
    getRolesAndPermissions: async () => {
        const roles = await Role.find().exec();
        if (!roles) {
            throw new ApiError({
                statusCode: 404, message: "No roles found", errors: [
                    { path: "roles", message: "No roles found in the database" }
                ]
            });
        }

        const rolesWithPermissions = await Promise.all(
            roles.map(async (role) => {
                const rolePermissions = await RolePermissionModel.find({ roleId: role._id })
                    .populate("permissionId")
                    .exec();

                return {
                    role,
                    permissions: rolePermissions.map((rp) => rp.permissionId),
                };
            })
        );


        return {
            message: "Roles and permissions fetched successfully",
            data: rolesWithPermissions,
        };
    }

};


export default userService;