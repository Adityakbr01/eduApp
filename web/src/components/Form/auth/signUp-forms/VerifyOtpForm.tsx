"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH } from "@/lib/CONSTANTS/AUTH";
import ROUTES from "@/lib/CONSTANTS/ROUTES";
import { secureLocalStorage } from "@/lib/utils/encryption";
import authMutations from "@/services/auth/mutations";
import { registerVerifyOtpSchema } from "@/validators/auth.schema";
import { Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Mask function
function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!name || name.length < 3) return email;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

export default function VerifyOtpForm() {
    const router = useRouter();

    const verifyOtp = authMutations.useVerifyRegisterOtp();
    const sendOtp = authMutations.useSendRegisterOtp();

    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [cooldown, setCooldown] = useState<(number)>(AUTH.SIGNUP_OTP_COOLDOWN);
    const intervalRef = useRef<number | null>(null);

    // Start cooldown function (clears any existing interval to avoid duplicates)
    const startCooldown = () => {
        setCooldown(AUTH.SIGNUP_OTP_COOLDOWN);

        // Clear existing interval if present
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        intervalRef.current = window.setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000) as unknown as number;
    };

    // ✅ Load data safely (fixes React cascading render error)
    useEffect(() => {
        const step = secureLocalStorage.getItem<string | null>("authStep", null);
        const savedData = secureLocalStorage.getItem<{ email: string } | null>("registerData", null);

        if (step !== "2" || !savedData?.email) {
            router.replace(ROUTES.AUTH.REGISTER_NEW_STUDENT);
            return;
        }

        // Safe state update (avoids cascading render warnings)
        setTimeout(() => {
            setEmail(savedData.email);
            // start cooldown asynchronously to avoid synchronous setState inside effect
            startCooldown();
        }, 0);

        // cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [router]);


    const handleVerify = () => {
        const parsed = registerVerifyOtpSchema.safeParse({ email, otp });

        if (!parsed.success) {
            toast.error(`Enter valid ${AUTH.SIGNUP_OTP_LENGTH}-digit OTP`);
            return;
        }

        verifyOtp.mutate(
            { email, otp },
            {
                onSuccess: () => {
                    secureLocalStorage.removeItem("authStep");
                    secureLocalStorage.removeItem("registerData");
                    secureLocalStorage.removeItem("registerFormData");
                    secureLocalStorage.removeItem("authStep");
                    router.push(ROUTES.AUTH.LOGIN);
                },
            }
        );
    };

    const handleResend = () => {
        sendOtp.mutate(
            { email },
            {
                onSuccess: () => {
                    startCooldown();
                },
            }
        );

    };


    return (
        <div className="max-w-sm w-full space-y-6 p-6 rounded-xl border-none shadow-none mx-auto">
            <h1 className="text-2xl font-semibold">Verify OTP</h1>

            <p className="text-sm text-muted-foreground">
                OTP sent to <span className="font-semibold">{maskEmail(email)}</span>
            </p>

            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    className="h-11 text-center tracking-widest text-lg pl-10"
                />
            </div>

            <Button
                onClick={handleVerify}
                disabled={verifyOtp.isPending}
                className="w-full h-11"
            >
                {verifyOtp.isPending ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                    "Verify OTP"
                )}
            </Button>

            <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                    {cooldown > 0
                        ? `Resend OTP in ${cooldown}s`
                        : "Didn't receive OTP?"}
                </p>

                <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || sendOtp.isPending}
                    className="text-blue-600 font-medium disabled:text-gray-400"
                >
                    {sendOtp.isPending ? "Sending..." : "Resend"}
                </button>
            </div>
        </div>
    );
}
