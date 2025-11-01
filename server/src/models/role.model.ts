import { Schema, model } from "mongoose";

const roleSchema = new Schema(
    {
        name: { type: String, unique: true, required: true }, // admin, student, instructor
        description: String,
    },
    { timestamps: true }
);

export const Role = model("Role", roleSchema);
