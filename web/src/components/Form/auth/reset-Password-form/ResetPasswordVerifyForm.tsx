"use client";

import {
    resetPasswordVerifySchema,
    type ResetPasswordVerifyInput,
} from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock, KeyRound } from "lucide-react";

import ROUTES from "@/lib/CONSTANTS/ROUTES";
import authMutations from "@/services/auth/mutations";
import { AxiosError } from "axios";

type ResetPasswordVerifyForm = ResetPasswordVerifyInput;

export default function ResetPasswordVerifyForm() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const verifyOtpMutation = authMutations.useVerifyResetPasswordOtp();

    const form = useForm<ResetPasswordVerifyForm>({
        resolver: zodResolver(resetPasswordVerifySchema),
        defaultValues: {
            email: "",
            otp: "",
            newPassword: "",
        },
        mode: "onBlur",
    });

    // Pre-fill email from query params
    useEffect(() => {
        const email = searchParams.get("email");
        if (email) {
            form.setValue("email", email);
        }
    }, [searchParams, form]);

    const onSubmit = async (data: ResetPasswordVerifyForm) => {
        console.log("🚀 Reset password verify submitted:", { ...data, newPassword: "***" });

        try {
            const result = await verifyOtpMutation.mutateAsync(data);
            console.log("✅ Password reset successful:", result);

            // Navigate to login page
            router.push(ROUTES.AUTH.LOGIN);
        } catch (error) {
            console.error("❌ Password reset failed:", error);
            if (error instanceof AxiosError && error.response) {
                const { status, data: errorData } = error.response;
                if (status === 400) {
                    form.setError("otp", {
                        type: "manual",
                        message: errorData?.message || "Invalid or expired OTP",
                    });
                } else if (status === 404) {
                    form.setError("email", {
                        type: "manual",
                        message: "User not found",
                    });
                }
            }
        }
    };

    const onError = (errors: unknown) => {
        console.log("❌ Form validation errors:", errors);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Email Address *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="user1@gmail.com"
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10"
                                        readOnly
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">OTP Code *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="812775"
                                        maxLength={6}
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10 tracking-widest"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">New Password *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={verifyOtpMutation.isPending}
                    className="w-full h-11 font-semibold rounded-lg"
                >
                    {verifyOtpMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Resetting Password...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <a
                        href={ROUTES.AUTH.LOGIN}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </a>
                </div>
            </form>
        </Form>
    );
}
