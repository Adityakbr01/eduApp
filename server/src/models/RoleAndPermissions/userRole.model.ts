import { Schema, model, Types } from "mongoose";

const userRoleSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        roleId: { type: Types.ObjectId, ref: "Role", required: true },
        approvedBy: { type: Types.ObjectId, ref: "User" }, // User who approved the role assignment
        approvalDate: { type: Date }, // Date of approval
    },
    { timestamps: true }
);

export const UserRole = model("UserRole", userRoleSchema);
