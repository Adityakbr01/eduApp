import { approvalStatus, type IUser } from "src/types/user.model.Type.js";
import { ApiError } from "src/utils/apiError.js";

function CheckUserEmailAndBanned(user: IUser) {

    if (!user) {
        throw new ApiError({
            statusCode: 404,
            message: "User not found",
            errors: [{ path: "email", message: "No account associated with this email" }],
        });
    }

    if (!user.approvalStatus || user.approvalStatus === approvalStatus.PENDING) {
        throw new ApiError({
            statusCode: 403,
            message: "Your account is not approved yet",
            errors: [{ path: "role", message: "Account is not approved yet" }],
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