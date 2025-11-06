import { Types } from "mongoose";
import { getUserPermissions } from "src/middlewares/user/getUserPermissions.js";
import { Role } from "src/models/RoleAndPermissions/role.model.js";
import { RolePermissionModel } from "src/models/RoleAndPermissions/rolePermission.model.js";
import User from "src/models/user.model.js";
import { approvalStatusEnum } from "src/types/user.model.Type.js";
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
        const rolesWithPermissions = await Role.aggregate([
            // 1️⃣ Join RolePermission to get permissions for each role
            {
                $lookup: {
                    from: "rolepermissions",      // RolePermission collection
                    localField: "_id",
                    foreignField: "roleId",
                    as: "rolePermissions"
                }
            },
            // 2️⃣ Join Permission collection to get permission details
            {
                $lookup: {
                    from: "permissions",
                    localField: "rolePermissions.permissionId",
                    foreignField: "_id",
                    as: "permissions"
                }
            },
            // 3️⃣ Project only needed fields
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    permissions: { _id: 1, code: 1, description: 1 } // optional: only these fields
                }
            }
        ]);

        if (!rolesWithPermissions || rolesWithPermissions.length === 0) {
            throw new ApiError({
                statusCode: 404,
                message: "No roles found",
                errors: [
                    { path: "roles", message: "No roles found in the database" }
                ]
            });
        }

        return {
            message: "Roles and permissions fetched successfully",
            data: rolesWithPermissions,
        };
    },
    approveUser: async (userId: string, approvedBy: string) => {

        const user = await User.findById(userId).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404, message: "User not found", errors: [
                    { path: "user", message: "No user found with the given ID" }
                ]
            });
        }

        if (user.approvalStatus === approvalStatusEnum.APPROVED) {
            throw new ApiError({
                statusCode: 400, message: "User already approved", errors: [
                    { path: "user", message: "User is already approved" }
                ]
            });
        }

        if (userId.toString() === approvedBy.toString()) {
            throw new ApiError({
                statusCode: 403, message: "User approval denied", errors: [
                    { path: "user", message: "You cannot approve your own account" }
                ]
            });
        }

        user.approvalStatus = approvalStatusEnum.APPROVED;
        user.approvedBy = new Types.ObjectId(approvedBy);
        await user.save();

        return {
            message: "User approved successfully",
            data: user,
        };
    },
};


export default userService;