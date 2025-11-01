import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: String,
        email: { type: String, unique: true, required: true },
        password: String,
    },
    { timestamps: true }
);

export const User = model("User", userSchema);
