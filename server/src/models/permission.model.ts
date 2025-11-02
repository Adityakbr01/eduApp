import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
    {
        code: { type: String, unique: true, required: true },
        description: String,
    },
    { timestamps: true }
);

export const Permission = model("Permission", permissionSchema);
