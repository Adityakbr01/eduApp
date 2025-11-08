import cacheManager from "./cacheManager.js";
import { cacheKeyFactory } from "./cacheKeyFactory.js";
import logger from "src/helpers/logger.js";

/**
 * Cache Invalidation Helpers
 * Centralized functions to invalidate related caches when data changes
 */

export const cacheInvalidation = {
    /**
     * Invalidate all user-related caches
     */
    async invalidateUser(userId: string): Promise<void> {
        try {
            await Promise.all([
                cacheManager.del(cacheKeyFactory.user.byId(userId)),
                cacheManager.del(cacheKeyFactory.user.permissions(userId)),
                cacheManager.del(cacheKeyFactory.user.all())
            ]);
        } catch (err) {
            logger.warn("Failed to invalidate user cache:", err);
        }
    },

    /**
     * Invalidate all users list cache
     */
    async invalidateUserList(): Promise<void> {
        try {
            await cacheManager.del(cacheKeyFactory.user.all());
        } catch (err) {
            logger.warn("Failed to invalidate user list cache:", err);
        }
    },

    /**
     * Invalidate role permissions cache
     * Call this when role permissions are updated
     */
    async invalidateRolePermissions(roleId: string): Promise<void> {
        try {
            await Promise.all([
                cacheManager.del(cacheKeyFactory.role.permissions(roleId)),
                cacheManager.del(cacheKeyFactory.role.all())
            ]);
        } catch (err) {
            logger.warn("Failed to invalidate role permissions cache:", err);
        }
    },

    /**
     * Invalidate all role-related caches
     * Call this when roles or permissions are modified
     */
    async invalidateAllRoles(): Promise<void> {
        try {
            // Invalidate all role permission patterns
            await cacheManager.delPattern("role:permissions:*");
            await cacheManager.del(cacheKeyFactory.role.all());
        } catch (err) {
            logger.warn("Failed to invalidate all roles cache:", err);
        }
    },

    /**
     * Invalidate all user permissions
     * Call this when permissions are assigned/removed from users
     */
    async invalidateAllUserPermissions(): Promise<void> {
        try {
            await cacheManager.delPattern("user:permissions:*");
        } catch (err) {
            logger.warn("Failed to invalidate all user permissions cache:", err);
        }
    },

    /**
     * Invalidate user permissions when their role permissions change
     * This affects all users with that role
     */
    async invalidateUsersWithRole(roleId: string): Promise<void> {
        try {
            // Invalidate role permissions
            await cacheManager.del(cacheKeyFactory.role.permissions(roleId));

            // Invalidate all user permissions (since we can't easily find all users with this role)
            // In production, you might want to query users with this roleId and invalidate specifically
            await cacheManager.delPattern("user:permissions:*");
        } catch (err) {
            logger.warn("Failed to invalidate users with role cache:", err);
        }
    },

    /**
     * Invalidate session cache for a user
     */
    async invalidateUserSession(userId: string): Promise<void> {
        try {
            await cacheManager.del(cacheKeyFactory.session.byUserId(userId));
        } catch (err) {
            logger.warn("Failed to invalidate user session cache:", err);
        }
    }
};

export default cacheInvalidation;
