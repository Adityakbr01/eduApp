import { Types } from "mongoose";
import { getUserPermissions } from "src/middlewares/user/getUserPermissions.js";
import { ApiError } from "src/utils/apiError.js";

// Type for caching role permissions Helper
type RolePermissionCache = Map<string, string[]>;
const toPlainUser = (user: any) =>
    typeof user?.toObject === "function" ? user.toObject() : { ...user };

const resolveRoleId = (role: any) => {
    if (!role) {
        throw new ApiError({
            statusCode: 500,
            message: "Missing role information for user",
            errors: [{ path: "roleId", message: "User record is missing role reference" }]
        });
    }

    if (role instanceof Types.ObjectId) {
        return role.toString();
    }

    if (typeof role === "string") {
        return role;
    }

    if (typeof role === "object") {
        if (role._id) return role._id.toString();
        if (role.id) return role.id.toString();
    }

    return String(role);
};

const attachPermissionsToUser = async (
    user: any,
    rolePermissionsCache: RolePermissionCache = new Map()
) => {
    const plainUser = toPlainUser(user);
    const roleId = resolveRoleId(plainUser.roleId ?? user.roleId);

    let rolePermissions = rolePermissionsCache.get(roleId);

    if (!rolePermissions) {
        const { permissions = [] } = await getUserPermissions(roleId);
        rolePermissions = [...(permissions || [])];
        rolePermissionsCache.set(roleId, rolePermissions);
    }

    const customPermissions = Array.isArray(plainUser.permissions) ? plainUser.permissions : [];
    const effectivePermissions = [...new Set([...rolePermissions, ...customPermissions])];

    return {
        ...plainUser,
        customPermissions,
        rolePermissions: [...rolePermissions],
        permissions: customPermissions,
        effectivePermissions,
    };
};

export { attachPermissionsToUser, type RolePermissionCache };