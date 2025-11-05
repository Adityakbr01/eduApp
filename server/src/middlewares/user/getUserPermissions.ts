import type { Types } from "mongoose";
import { Permission } from "src/models/RoleAndPermissions/permission.model.js";
import { RolePermissionModel } from "src/models/RoleAndPermissions/rolePermission.model.js";

export const getUserPermissions = async (roleId: string | Types.ObjectId) => {
    const rolePermissions = await RolePermissionModel.find({ roleId }).lean();

    const permissionIds = rolePermissions.map(rp => rp.permissionId);

    const permissions = await Permission.find({ _id: { $in: permissionIds } })
        .select("code")
        .lean();
    return permissions.map(p => p.code);
};
