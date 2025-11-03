import { Permission } from "src/models/RoleAndPermissions/permission.model.js";
import { RolePermission } from "src/models/RoleAndPermissions/rolePermission.model.js";
import { UserRole } from "src/models/RoleAndPermissions/userRole.model.js";


export const getUserPermissions = async (userId: string) => {
    const userRoles = await UserRole.find({ userId });

    const roleIds = userRoles.map(r => r.roleId);

    const rolePermissions = await RolePermission.find({
        roleId: { $in: roleIds }
    });

    const permissionIds = rolePermissions.map(rp => rp.permissionId);

    const permissions = await Permission.find({
        _id: { $in: permissionIds }
    });

    return permissions.map(p => p.code);
};
