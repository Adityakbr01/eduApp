import mongoose from "mongoose";
import _config from "src/configs/_config.js";

import { RolePermissionModel } from "src/models/RoleAndPermissions/rolePermission.model.js";
import { PermissionModel } from "src/models/RoleAndPermissions/permission.model.js";
import { RoleModel } from "src/models/RoleAndPermissions/role.model.js";

// ✅ Import constants
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import { ROLE_PERMISSIONS } from "src/constants/rolePermissions.js";
import logger from "src/helpers/logger.js";

async function seedRBAC() {
    try {
        logger.info("🚀 Connecting DB...");
        await mongoose.connect(_config.MONGO_URI);
        logger.info("✅ DB connected\n");

        // ✅ Insert Permissions
        logger.info("📌 Seeding Permissions...");
        const permissionIdMap = {};

        for (const permission of Object.values(PERMISSIONS)) {
            const p = await PermissionModel.findOneAndUpdate(
                { code: permission },
                { code: permission, description: `Permission: ${permission}` },
                { upsert: true, new: true }
            );
            permissionIdMap[permission] = p._id;
        }

        // ✅ Insert Roles & Map Permissions
        logger.info("\n📌 Seeding Roles & Mapping Permissions...");
        for (const role of Object.values(ROLES)) {
            const r = await RoleModel.findOneAndUpdate(
                { name: role },
                { name: role, description: `${role} role in system` },
                { upsert: true, new: true }
            );

            const rolePermissions = ROLE_PERMISSIONS[role] || [];

            for (const perm of rolePermissions) {
                await RolePermissionModel.findOneAndUpdate(
                    { roleId: r._id, permissionId: permissionIdMap[perm] },
                    { roleId: r._id, permissionId: permissionIdMap[perm] },
                    { upsert: true }
                );
            }
        }

        logger.info("\n✅ RBAC Seed Complete!");
        process.exit(0);
    } catch (err) {
        logger.error("❌ Seeder Error:", err);
        process.exit(1);
    }
}

seedRBAC();
