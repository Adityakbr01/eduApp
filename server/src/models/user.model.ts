import bcrypt from "bcryptjs";
import type { Secret, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import _config from "src/configs/_config.js";
import { approvalStatus, type IUser } from "src/types/user.model.Type.js";
import { ROLES } from "../constants/roles.js";


const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true, select: false },

        role: {
            type: String,
            enum: ROLES,
            required: true,
        },

        //JWT & Verification
        accessToken: {
            type: String,
            select: false,
            required: false,
        },
        refreshToken: {
            type: String,
            select: false,
            required: false,
        },
        //all Otp store and expiry , e.g for verify email , reset password etc.
        verifyOtp: {
            type: String,
            select: false,
            required: false,
        },
        verifyOtpExpiry: {
            type: Date,
            select: false,
            required: false,
        },

        isEmailVerified: { type: Boolean, default: false },

        //! Contact Information
        phone: {
            type: String, unique: true,
            sparse: true,
            required: false
        },
        address: {
            type: String,
            required: false,
            select: false,
        },



        // Approval Flow
        approvalStatus: {
            type: String,
            enum: approvalStatus,
            default: function () {
                return this.role === ROLES.STUDENT ? approvalStatus.APPROVED : approvalStatus.PENDING;
            },
        },

        approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

        // Specific Permissions beyond role-based permissions (rarely used)
        permissions: [{ type: String }], // e.g. ["READ_USER", "WRITE_COURSE"]
        //! Global Flags
        isBanned: { type: Boolean, default: false },


        //! Role Approval Flow
        // For Manager — approved by Admin
        isManagerApproved: { type: Boolean, default: undefined, required: false },

        // For Instructor — approved by Manager
        isInstructorApproved: { type: Boolean, default: undefined, required: false },

        //! Support Team Profile
        isSupportTeamApproved: { type: Boolean, default: undefined, required: false },

        //! Instructor Profile (only create for instructor users)
        instructorProfile: {
            // Prevent automatic _id for nested schema
            type: new Schema({
                bio: String,
                expertise: [String],
                experience: Number,
            }, { _id: false }),

            // Do NOT create by default
            default: undefined,

            // Do not show unless asked
            select: false
        },

        //! Student Profile (only for student users)
        studentProfile: {
            type: new Schema({
                enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
                progress: { type: Map, of: Number },
            }, { _id: false }),

            default: undefined
        },

        //! Manager Profile (only for manager users)
        managerProfile: {
            type: new Schema({
                department: String,
                teamSize: Number,
            }, { _id: false }),

            default: undefined,
            select: false
        },

        //! Support Team Profile (only for support users)
        supportTeamProfile: {
            type: new Schema({
                shiftTimings: String,
                expertiseAreas: [String],
            }, { _id: false }),

            default: undefined,
            select: false
        },

    },
    { timestamps: true }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(_config.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        _config.JWT_ACCESS_TOKEN_SECRET as Secret,
        { expiresIn: _config.JWT_ACCESS_TOKEN_EXPIRES_IN as string } as SignOptions
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        _config.JWT_REFRESH_TOKEN_SECRET as Secret,
        { expiresIn: _config.JWT_REFRESH_TOKEN_EXPIRES_IN as string } as SignOptions
    );
};


const User = model("User", userSchema);


export default User;