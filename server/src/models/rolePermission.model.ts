import { Schema, model, Types } from "mongoose";

const rolePermissionSchema = new Schema(
    {
        roleId: { type: Types.ObjectId, ref: "Role", required: true },
        permissionId: { type: Types.ObjectId, ref: "Permission", required: true },
    },
    { timestamps: true }
);

export const RolePermission = model("RolePermission", rolePermissionSchema);
