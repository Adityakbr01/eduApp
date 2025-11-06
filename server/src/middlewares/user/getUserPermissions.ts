import { Types } from "mongoose";
import { RolePermissionModel } from "src/models/RoleAndPermissions/rolePermission.model.js";

export const getUserPermissions = async (roleId: string | Types.ObjectId) => {
    const roleObjectId = new Types.ObjectId(roleId);

    const result = await RolePermissionModel.aggregate([
        // 1️⃣ Filter by roleId (indexed for performance)
        { $match: { roleId: roleObjectId } },

        // 2️⃣ Join with permissions
        {
            $lookup: {
                from: "permissions",          // Permission collection
                localField: "permissionId",
                foreignField: "_id",
                as: "permissionDetails"
            }
        },
        { $unwind: "$permissionDetails" },

        // 3️⃣ Group by roleId to deduplicate permissions
        {
            $group: {
                _id: "$roleId",
                permissions: { $addToSet: "$permissionDetails.code" } // $addToSet removes duplicates
            }
        },

        // 4️⃣ Join with role to get role name
        {
            $lookup: {
                from: "roles",
                localField: "_id",
                foreignField: "_id",
                as: "roleDetails"
            }
        },
        { $unwind: "$roleDetails" },

        // 5️⃣ Project only required fields
        {
            $project: {
                _id: 0,
                role: "$roleDetails.name",
                permissions: 1
            }
        }
    ]);

    // Aggregation returns single doc per role
    return result[0] || { role: null, permissions: [] };
};
