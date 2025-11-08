"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    registerSchema,
    type RegisterSchemaInput,
    ROLES
} from "@/validators/auth.schema";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import authMutations from "@/services/auth/mutations";
import toast from "react-hot-toast";

import {
    BaseProfileForm,
    InstructorForm,
    ManagerForm,
    SupportTeamForm,
} from "@/components/Form/auth/register-forms";

import { secureLocalStorage } from "@/lib/utils/encryption";

type RegisterFormData = RegisterSchemaInput;


export default function RegisterPage() {
    const router = useRouter();


    const savedFinal = typeof window !== "undefined"
        ? secureLocalStorage.getItem<RegisterFormData>("registerData", null)
        : null;

    const savedDraft = typeof window !== "undefined"
        ? secureLocalStorage.getItem<Partial<RegisterFormData>>("registerFormData", null)
        : null;

    const restored = (savedFinal ?? savedDraft) as RegisterFormData | null;
    const initialValues: RegisterFormData = restored ?? {
        role: ROLES.STUDENT,
        name: "",
        email: "",
        password: "",
        phone: undefined,
        address: undefined,
    };

    const [selectedRole, setSelectedRole] = useState(initialValues.role);

    const { mutate: register, isPending } = authMutations.useRegister({
        onSuccess: (data) => {

            const fullFormData = form.getValues();

            // ✅ Save encrypted full form for OTP page
            secureLocalStorage.setItem("registerData", fullFormData);

            // Also set plain email for the OTP page (verify-otp reads localStorage.registerEmail)
            if (fullFormData?.email) {
                try {
                    localStorage.setItem("registerEmail", fullFormData.email);
                } catch {
                    // ignore localStorage errors
                }
            }

            // ✅ Clear draft form
            secureLocalStorage.removeItem("registerFormData");

            toast.success(data.message || "Registration successful!");

            if (selectedRole === ROLES.STUDENT) {
                setTimeout(() => {
                    router.push("/auth/register/verify-otp");
                }, 1500)
            } else {
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            }
        },
    });

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    });

    useEffect(() => {
        form.reset(initialValues);
        setSelectedRole(initialValues.role);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const subscription = form.watch((value) => {
            secureLocalStorage.setItem("registerFormData", value);
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role as RegisterFormData["role"]);
        form.setValue("role", role as RegisterFormData["role"]);
    };

    const onSubmit = (data: RegisterFormData) => {
        register(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-2xl shadow-lg">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                        <p className="text-slate-600">
                            Join our learning platform and start your journey
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="role"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Role *</FormLabel>
                                        <Select
                                            value={selectedRole}
                                            onValueChange={handleRoleChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value={ROLES.STUDENT}>Student</SelectItem>
                                                <SelectItem value={ROLES.INSTRUCTOR}>Instructor</SelectItem>
                                                <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                                                <SelectItem value={ROLES.SUPPORT}>Support Team</SelectItem>
                                                <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Base profile */}
                            <BaseProfileForm form={form} />

                            {/* Conditional role sections */}
                            {selectedRole === ROLES.INSTRUCTOR && <InstructorForm form={form} />}
                            {selectedRole === ROLES.MANAGER && <ManagerForm form={form} />}
                            {selectedRole === ROLES.SUPPORT && <SupportTeamForm form={form} />}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                            >
                                {isPending ? "Creating Account..." : "Create Account"}
                            </Button>

                            <p className="text-center text-slate-600">
                                Already have an account?
                                <Link href="/auth/login" className="text-blue-600 ml-1">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </Card>
        </div>
    );
}
