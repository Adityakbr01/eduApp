
import ResetPasswordVerifyPage from "@/components/pages/Auth/ResetPasswordVerifyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify OTP | EduApp",
    description: "Enter the OTP sent to your email and set a new password.",
};

export default function Page() {
    return <ResetPasswordVerifyPage />;
}
