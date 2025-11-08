export const QUERY_KEYS = {
    // Auth
    AUTH: {
        ME: ["auth", "me"],
        PROFILE: ["auth", "profile"],
    },

    // Users
    USERS: {
        ALL: ["users"],
        LIST: (page: number) => ["users", "list", page],
        DETAIL: (id: string) => ["users", "detail", id],
    },
};
