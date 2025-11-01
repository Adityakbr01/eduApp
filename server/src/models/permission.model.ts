import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
    {
        code: { type: String, unique: true, required: true }, // course:create
        description: String,
    },
    { timestamps: true }
);

export const Permission = model("Permission", permissionSchema);
