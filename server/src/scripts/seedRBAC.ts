import mongoose from "mongoose";
import _config from "src/configs/_config.js";

import { Permission } from "src/models/permission.model.js";
import { Role } from "src/models/role.model.js";
import { RolePermission } from "src/models/rolePermission.model.js";

// ✅ Import constants
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import { ROLE_PERMISSIONS } from "src/constants/rolePermissions.js";

async function seedRBAC() {
    try {
        console.log("🚀 Connecting DB...");
        await mongoose.connect(_config.MONGO_URI);
        console.log("✅ DB connected\n");

        // ✅ Insert Permissions
        console.log("📌 Seeding Permissions...");
        const permissionIdMap = {};

        for (const permission of Object.values(PERMISSIONS)) {
            const p = await Permission.findOneAndUpdate(
                { code: permission },
                { code: permission, description: `Permission: ${permission}` },
                { upsert: true, new: true }
            );
            permissionIdMap[permission] = p._id;
        }

        // ✅ Insert Roles & Map Permissions
        console.log("\n📌 Seeding Roles & Mapping Permissions...");
        for (const role of Object.values(ROLES)) {
            const r = await Role.findOneAndUpdate(
                { name: role },
                { name: role, description: `${role} role in system` },
                { upsert: true, new: true }
            );

            const rolePermissions = ROLE_PERMISSIONS[role] || [];

            for (const perm of rolePermissions) {
                await RolePermission.findOneAndUpdate(
                    { roleId: r._id, permissionId: permissionIdMap[perm] },
                    { roleId: r._id, permissionId: permissionIdMap[perm] },
                    { upsert: true }
                );
            }
        }

        console.log("\n✅ RBAC Seed Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeder Error:", err);
        process.exit(1);
    }
}

seedRBAC();
