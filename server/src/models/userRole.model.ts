import { Schema, model, Types } from "mongoose";

const userRoleSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        roleId: { type: Types.ObjectId, ref: "Role", required: true },
    },
    { timestamps: true }
);

export const UserRole = model("UserRole", userRoleSchema);
