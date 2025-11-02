import { Schema, model } from "mongoose";
import { ROLES } from "../constants/roles.js";
import type { IUser } from "src/types/user.model.Type.js";

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },

        role: {
            type: String,
            enum: ROLES,
            required: true,
        },

        //! Global Flags
        isBanned: { type: Boolean, default: false },

        //! Role Approval Flow
        // For Manager — approved by Admin
        isManagerApproved: { type: Boolean, default: false },

        // For Instructor — approved by Manager
        isInstructorApproved: { type: Boolean, default: false },

        //! Support Team Profile
        isSupportTeamApproved: { type: Boolean, default: false },

        //! Instructor Profile
        instructorProfile: {
            bio: String,
            expertise: [String],
            experience: Number,
        },

        //! Student Profile
        studentProfile: {
            enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
            progress: { type: Map, of: Number },
        },

        //! Manager Profile
        managerProfile: {
            department: String,
            teamSize: Number,
        },

        //! Support Team Profile
        supportTeamProfile: {
            shiftTimings: String,
            expertiseAreas: [String],
        },
    },
    { timestamps: true }
);

export const User = model("User", userSchema);
