import { UserDocument } from "../../models/user.model";

declare global {
    namespace Express {
        interface UserPermission {
            roles?: string[];
            permissions?: string[];
            id?: UserDocument["_id"];
        }

        interface Request {
            user?: UserPermission | null;
        }
    }
}
