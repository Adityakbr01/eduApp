import _config from "src/configs/_config.js";
import cacheManager from "src/cache/cacheManager.js";
import logger from "src/helpers/logger.js";

/**
 * Session Service - Manages user sessions in Redis
 * Implements single device login by storing active refresh tokens
 */

interface SessionData {
    refreshToken: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
}

class SessionService {
    /**
     * Generate Redis key for user session
     */
    private getSessionKey(userId: string): string {
        return `session:user:${userId}`;
    }

    /**
     * Create or update user session in Redis
     * Overwrites any existing session (enforces single device login)
     */
    async createSession(userId: string, refreshToken: string): Promise<void> {
        logger.info(`🔐 Creating session for user: ${userId}`);

        const sessionKey = this.getSessionKey(userId);
        const ttl = _config.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS;
        const now = Date.now();

        const sessionData: SessionData = {
            refreshToken,
            userId,
            createdAt: now,
            expiresAt: now + (ttl * 1000),
        };

        await cacheManager.set(sessionKey, sessionData, ttl);
        logger.info(`✅ Session created successfully for user: ${userId}, expires in ${ttl}s`);
    }

    /**
     * Validate if the provided refresh token matches the stored session
     * Returns true if valid, false otherwise
     */
    async validateSession(userId: string, refreshToken: string): Promise<boolean> {
        logger.info(`🔍 Validating session for user: ${userId}`);

        const sessionKey = this.getSessionKey(userId);
        const sessionData = await cacheManager.get(sessionKey) as SessionData | null;

        if (!sessionData) {
            logger.info(`❌ No session found for user: ${userId}`);
            return false;
        }

        // Check if session has expired
        if (sessionData.expiresAt < Date.now()) {
            logger.info(`❌ Session expired for user: ${userId}`);
            await this.deleteSession(userId);
            return false;
        }

        // Verify refresh token matches
        const isValid = sessionData.refreshToken === refreshToken;

        if (isValid) {
            logger.info(`✅ Session valid for user: ${userId}`);
        } else {
            logger.info(`❌ Refresh token mismatch for user: ${userId} - User logged in on another device`);
        }

        return isValid;
    }

    /**
     * Get active session data
     */
    async getSession(userId: string): Promise<SessionData | null> {
        const sessionKey = this.getSessionKey(userId);
        return await cacheManager.get(sessionKey) as SessionData | null;
    }

    /**
     * Delete user session from Redis
     */
    async deleteSession(userId: string): Promise<void> {
        logger.info(`🗑️ Deleting session for user: ${userId}`);
        const sessionKey = this.getSessionKey(userId);
        await cacheManager.del(sessionKey);
        logger.info(`✅ Session deleted for user: ${userId}`);
    }

    /**
     * Update session with new refresh token (used during token refresh)
     */
    async updateSession(userId: string, newRefreshToken: string): Promise<void> {
        const sessionKey = this.getSessionKey(userId);
        const existingSession = await cacheManager.get(sessionKey) as SessionData | null;

        if (!existingSession) {
            throw new Error("Session not found");
        }

        const ttl = _config.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS;
        const now = Date.now();

        const updatedSession: SessionData = {
            ...existingSession,
            refreshToken: newRefreshToken,
            expiresAt: now + (ttl * 1000),
        };

        await cacheManager.set(sessionKey, updatedSession, ttl);
    }

    /**
     * Check if user has an active session
     */
    async hasActiveSession(userId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        if (!session) return false;

        // Check expiration
        return session.expiresAt > Date.now();
    }
}

export default new SessionService();
