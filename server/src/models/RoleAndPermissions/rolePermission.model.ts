import { Schema, model, Types } from "mongoose";

const rolePermissionSchema = new Schema(
    {
        roleId: { type: Types.ObjectId, ref: "Role", required: true }, // Reference to Role
        permissionId: { type: Types.ObjectId, ref: "Permission", required: true }, // Reference to Permission
    },
    { timestamps: true }
);

export const RolePermissionModel = model("RolePermission", rolePermissionSchema);
