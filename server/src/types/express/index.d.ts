// server/src/types/express/index.d.ts
import { UserDocument } from "../../models/user.model";

declare global {
    namespace Express {
        interface UserPermission {
            role?: string;
            permissions?: string[];
            id?: UserDocument["_id"];
            roleId?: UserDocument["roleId"];
        }

        interface Request {
            user?: UserPermission | null;
        }
    }
}
