"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import authMutations from "@/services/auth/mutations";
import toast from "react-hot-toast";
import { registerVerifyOtpSchema, type RegisterSchemaInput } from "@/validators/auth.schema";
import { secureLocalStorage } from "@/lib/utils/encryption";



type VerifyOtpFormData = z.infer<typeof registerVerifyOtpSchema>;

const RESEND_COOLDOWN = 30; // seconds

export default function VerifyOtpPage() {
    const router = useRouter();
    const [resendCooldown, setResendCooldown] = useState(0);
    const [watchEmail, setWatchEmail] = useState("");
    const { mutate: verifyOtp, isPending: isVerifying } = authMutations.useVerifyRegisterOtp({
        onSuccess: (data) => {
            toast.success(data.message || "Email verified successfully! Redirecting to login...");
            localStorage.removeItem("registerEmail"); // Clear after successful verification
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        },
    });

    const { mutate: resendOtp, isPending: isResending } = authMutations.useSendRegisterOtp({
        onSuccess: (data) => {
            console.log("Resend OTP response:", data);
            toast.success(data?.message || "OTP sent successfully!");
            setResendCooldown(RESEND_COOLDOWN);
        },
    });

    const form = useForm<VerifyOtpFormData>({
        resolver: zodResolver(registerVerifyOtpSchema),
        defaultValues: {
            email: "",
            otp: "",
        },
        mode: "onBlur",
    });

    // Load email from multiple sources on mount (plain localStorage, encrypted final save, encrypted draft)
    useEffect(() => {
        // 1) plain localStorage (set by register page for quick OTP)
        const plain = typeof window !== "undefined" ? localStorage.getItem("registerEmail") : null;
        if (plain) {
            form.setValue("email", plain);
            setWatchEmail(plain);
            return;
        }

        // 2) encrypted final saved registration data
        const savedFinal = typeof window !== "undefined" ? secureLocalStorage.getItem<RegisterSchemaInput>("registerData", null) : null;
        if (savedFinal?.email) {
            form.setValue("email", savedFinal.email);
            setWatchEmail(savedFinal.email);
            return;
        }

        // 3) encrypted draft
        const draft = typeof window !== "undefined" ? secureLocalStorage.getItem<Partial<RegisterSchemaInput>>("registerFormData", null) : null;
        if (draft?.email) {
            form.setValue("email", draft.email);
            setWatchEmail(draft.email);
            return;
        }
    }, [form]);

    // Track email changes for rendering
    useEffect(() => {
        const subscription = form.watch((value) => {
            setWatchEmail(value.email || "");
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const onSubmit = (data: VerifyOtpFormData) => {
        verifyOtp(data);

    };

    const handleResendOtp = () => {
        const email = form.getValues("email");
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }
        resendOtp({ email });
    };

    const storedEmail = (typeof window !== "undefined" ? localStorage.getItem("registerEmail") : null)
        || (typeof window !== "undefined" ? secureLocalStorage.getItem<RegisterSchemaInput>("registerData", null)?.email : null)
        || (typeof window !== "undefined" ? secureLocalStorage.getItem<Partial<RegisterSchemaInput>>("registerFormData", null)?.email : null);

    if (!storedEmail && !watchEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
                <Card className="w-full max-w-md shadow-xl border-0">
                    <div className="pt-8 px-8">
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-red-100 p-4">
                                    <svg
                                        className="w-8 h-8 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Email Required
                            </h2>
                            <p className="text-slate-600 mb-6">
                                Please go back to the register page and complete the registration process
                                first.
                            </p>
                            <Link href="/auth/register" className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Back to Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-lg"></div>
                                <div className="relative bg-blue-100 rounded-full p-4">
                                    <svg
                                        className="w-8 h-8 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/* Title and Description */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900">
                                Verify Your Email
                            </h1>
                            <p className="text-slate-600 text-base">
                                We&apos;ve sent a 6-digit code to your email address
                            </p>
                        </div>
                        {/* Email Display */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                                Code sent to
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-slate-900 break-all text-sm">
                                    {watchEmail}
                                </p>
                                <Badge variant="secondary" className="shrink-0">
                                    Sent
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field (Hidden) */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* OTP Field */}
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base">Verification Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="000000"
                                                maxLength={6}
                                                type="text"
                                                inputMode="numeric"
                                                className="text-center text-4xl tracking-[0.5rem] font-mono font-semibold h-14 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:ring-0"
                                                autoComplete="off"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the 6-digit code sent to your email
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isVerifying || !form.watch("otp")}
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                            >
                                {isVerifying ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </div>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>
                        </form>
                    </Form>
                    {/* Divider */}
                    <div className="border-t border-slate-200"></div>
                    {/* Resend OTP Section */}
                    <div className="space-y-4">
                        <p className="text-center text-sm text-slate-600 font-medium">
                            Didn&apos;t receive the code?
                        </p>
                        {resendCooldown > 0 ? (
                            <Button disabled variant="outline" size="lg" className="w-full">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Resend in {resendCooldown}s
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isResending || !watchEmail}
                                variant="outline"
                                size="lg"
                                className="w-full"
                            >
                                {isResending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </div>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                        Resend Code
                                    </>
                                )}
                            </Button>
                        )}
                        {resendCooldown > 0 && (
                            <p className="text-xs text-slate-500 text-center">
                                Please wait before requesting a new code
                            </p>
                        )}
                    </div>
                    {/* Divider */}
                    <div className="border-t border-slate-200"></div>
                    {/* Help Links */}
                    <div className="space-y-3">
                        <Link href="/auth/register" className="block">
                            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Back to Register
                            </Button>
                        </Link>
                        <Link href="/auth/login" className="block">
                            <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                                Already verified? Login here
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}