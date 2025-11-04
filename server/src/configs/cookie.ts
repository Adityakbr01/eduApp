import _config from "./_config.js";

const isProduction = _config.NODE_ENV === "production";

// Access Token Cookie Config
export const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: Number(_config.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS) * 1000, // 15 minutes
    path: "/", // ensure it’s available on all routes
};

// Refresh Token Cookie Config
export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: Number(_config.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS) * 1000, // 7 days
    path: "/",
};