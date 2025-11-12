
const ROUTES = {
    HOME: "/",
    AUTH: {
        LOGIN: "/signin",
        REGISTER_NEW_STUDENT: "/signup/newStudent",
        REGISTER_NEW_INSTRUCTOR: "/signup/newInstructor",
        REGISTER_NEW_MANAGER: "/signup/newManager",
        REGISTER_NEW_SUPPORT: "/signup/newSupport",
        VERIFY_OTP: "/signup/verify-otp",
        RESET_PASSWORD: "/reset-password",
        RESET_PASSWORD_VERIFY: "/reset-password/verify",
    },
    USERS: {
        Admin: {
            DASHBOARD: "/admin/dashboard",
        },
        MANAGER: {
            DASHBOARD: "/manager/dashboard",
        },
        SUPPORT_TEAM: {
            DASHBOARD: "SUPPORT_TEAM/dashboard",
        },
        INSTRUCTOR: {
            DASHBOARD: "/instructor/dashboard",
        }
    },
};

export default ROUTES;