import type { IUser } from "src/types/user.model.Type.js";
import { ApiError } from "src/utils/apiError.js";

function CheckUserEmailAndBanned(user: IUser) {
    if (!user) {
        throw new ApiError({
            statusCode: 404,
            message: "User not found",
            errors: [{ path: "email", message: "No account associated with this email" }],
        });
    }
    if (!user.isEmailVerified) {
        throw new ApiError({
            statusCode: 400,
            message: "Email is not  verified",
            errors: [{ path: "email", message: "Email is not verified" }],
        });
    }
    if (user.isBanned) {
        throw new ApiError({
            statusCode: 403,
            message: "Your account is banned",
            errors: [{ path: "email", message: "Email is banned" }],
        });
    }
}

export default CheckUserEmailAndBanned