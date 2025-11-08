export const cacheKeyFactory = {
    user: {
        byId: (id: string) => `user:id:${id}`,
        activity: (id: string) => `user:activity:${id}`,
        all: () => `users:all`,
        permissions: (userId: string) => `user:permissions:${userId}`
    },
    session: {
        byUserId: (userId: string) => `session:user:${userId}`
    },
    role: {
        permissions: (roleId: string) => `role:permissions:${roleId}`,
        all: () => `roles:all`
    }
};
