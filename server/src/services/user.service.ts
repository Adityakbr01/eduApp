import { Types } from "mongoose";
import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob, EMAIL_JOB_Names } from "src/bull/workers/email.worker.js";
import { getUserPermissions } from "src/middlewares/user/getUserPermissions.js";
import { RoleModel } from "src/models/RoleAndPermissions/role.model.js";
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
        const rolesWithPermissions = await RoleModel.aggregate([
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
    assignPermissions: async (assignData: { userId: string; permission: string[] }, assignBy: string) => {
        const { userId, permission } = assignData;


        if (assignBy.toString() === userId.toString()) {
            throw new ApiError({
                statusCode: 403,
                message: "User cannot assign permissions to themselves",
                errors: [
                    { path: "user", message: "You cannot assign permissions to your own account" }
                ]
            });
        }

        const user = await User.findById(userId).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "user", message: "No user found with the given ID" }]
            });
        }

        // ✅ FIX — get only permissions array
        const { permissions: rolePermissions } = await getUserPermissions(user.roleId);

        const existingPermissions = [
            ...new Set([
                ...(rolePermissions || []),
                ...(user.permissions || [])
            ])
        ];

        const newPermissions = permission.filter(p => !existingPermissions.includes(p));

        if (newPermissions.length === 0) {
            throw new ApiError({
                statusCode: 400,
                message: "User already has the given permissions",
                errors: [{ path: "permissions", message: "User already has the given permissions" }]
            });
        }

        user.permissions = [...user.permissions, ...newPermissions];
        await user.save();

        return {
            message: "Permissions assigned successfully",
            data: user,
        };
    },
    deletePermissions: async (deleteData: { userId: string; permission: string[] }, deleteBy: string) => {
        const { userId, permission } = deleteData;
        if (deleteBy.toString() === userId.toString()) {
            throw new ApiError({
                statusCode: 403,
                message: "User cannot delete permissions from themselves",
                errors: [{ path: "user", message: "You cannot delete permissions from your own account" }]
            });
        }
        const user = await User.findById(userId).exec();
        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
                errors: [{ path: "user", message: "No user found with the given ID" }]
            });
        }
        const updatedPermissions = (user.permissions || []).filter(p => !permission.includes(p));
        if (updatedPermissions.length === user.permissions.length) {
            throw new ApiError({
                statusCode: 400,
                message: "User does not have the given permissions",
                errors: [{ path: "permissions", message: "User does not have the given permissions" }]
            });
        }

        user.permissions = updatedPermissions;
        await user.save();

        return {
            message: "Permissions deleted successfully",
            data: user,
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

        await addEmailJob(emailQueue, EMAIL_JOB_Names.ACCOUNT_APPROVAL, {
            to: user.email,
        });
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