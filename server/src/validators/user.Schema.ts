import { ROLES } from "src/constants/roles.js";
import z from "zod";

const baseSchema = {
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Must include at least one uppercase letter")
        .regex(/[a-z]/, "Must include at least one lowercase letter")
        .regex(/[0-9]/, "Must include at least one number"),
    phone: z.string().optional().refine(
        (value) => !value || /^[0-9]{10}$/.test(value),
        "Invalid phone format"
    ),
    address: z.string().optional(),
};

// Role-specific profile schemas
const managerProfileSchema = z.object({
    department: z.string().min(2, "Department required"),
    teamSize: z.number().min(1, "Team size required"),
});

const instructorProfileSchema = z.object({
    bio: z.string().min(10, "Bio must be at least 10 chars"),
    expertise: z.array(z.string()).min(1, "At least one expertise required"),
    experience: z.number().min(1, "Experience required"),
});

const supportTeamProfileSchema = z.object({
    shiftTimings: z.string().min(2, "Shift timing required"),
    expertiseAreas: z.array(z.string()).min(1, "Expertise areas required"),
});



const registerSchema = z.discriminatedUnion("role", [
    z.object({
        ...baseSchema,
        role: z.literal(ROLES.STUDENT),
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.MANAGER),
        managerProfile: managerProfileSchema,
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.INSTRUCTOR),
        instructorProfile: instructorProfileSchema,
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.SUPPORT),
        supportTeamProfile: supportTeamProfileSchema,
    }),

    // If admin signup allowed
    z.object({
        ...baseSchema,
        role: z.literal(ROLES.ADMIN),
    }),
]);

//Register and Verify OTP
const registerOtpSchema = z.object({
    email: z.string().email("Invalid email"),
});

const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 characters"),
});


const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

export { registerSchema, loginSchema, registerOtpSchema, verifyOtpSchema };
export type RegisterSchemaInput = z.infer<typeof registerSchema>;
export type LoginSchemaInput = z.infer<typeof loginSchema>;
