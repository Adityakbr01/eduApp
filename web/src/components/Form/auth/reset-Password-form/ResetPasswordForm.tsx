"use client";

import {
    resetPasswordEmailSchema,
    type ResetPasswordEmailInput,
} from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { Loader2, Mail } from "lucide-react";

import ROUTES from "@/lib/CONSTANTS/ROUTES";
import authMutations from "@/services/auth/mutations";
import { AxiosError } from "axios";

type ResetPasswordForm = ResetPasswordEmailInput;

export default function ResetPasswordForm() {
    const router = useRouter();
    const sendOtpMutation = authMutations.useSendResetPasswordOtp();

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordEmailSchema),
        defaultValues: {
            email: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        try {
            await sendOtpMutation.mutateAsync(data);

            // Navigate to verify OTP page with email in state
            router.push(`${ROUTES.AUTH.RESET_PASSWORD_VERIFY}?email=${encodeURIComponent(data.email)}`);
        } catch (error) {
            console.error("❌ Failed to send OTP:", error);
            if (error instanceof AxiosError && error.response) {
                const { status } = error.response;
                if (status === 404) {
                    form.setError("email", {
                        type: "manual",
                        message: "User not found. Please sign up first.",
                    });
                }
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={sendOtpMutation.isPending}
                    className="w-full h-11 font-semibold rounded-lg"
                >
                    {sendOtpMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Sending OTP...
                        </>
                    ) : (
                        "Send OTP"
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