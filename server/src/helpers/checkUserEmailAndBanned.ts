import { approvalStatusEnum, type IUser } from "src/types/user.model.Type.js";
import { ApiError } from "src/utils/apiError.js";

function CheckUserEmailAndBanned(user: IUser) {

    // ✅ User does not exist
    if (!user) {
        throw new ApiError({
            statusCode: 404,
            message: "Account not found",
            errors: [
                {
                    path: "email",
                    message: "No account exists with the provided email address"
                }
            ],
        });
    }

    // ✅ Account pending approval
    if (!user.approvalStatus || user.approvalStatus === approvalStatusEnum.PENDING) {
        throw new ApiError({
            statusCode: 403,
            message: "Your account is awaiting for approval",
            errors: [
                {
                    path: "approvalStatus",
                    message: "Your account has not been reviewed or approved yet"
                }
            ],
        });
    }

    // ✅ Banned account
    if (user.isBanned) {
        throw new ApiError({
            statusCode: 403,
            message: "Your account has been suspended",
            errors: [
                {
                    path: "email",
                    message: "This email is linked to a suspended account"
                }
            ],
        });
    }
}

export default CheckUserEmailAndBanned;
