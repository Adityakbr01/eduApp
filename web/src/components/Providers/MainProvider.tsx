"use client";
import React from "react";
import ReactToast from "./ReactToast";
import { TanStackProvider } from "./TanStackProvider";
import { useInitUser } from "@/services/auth/useInitUser";

// Separate component for auth initialization
function AuthInitializer() {

    useInitUser();
    return null;
}

function MainProvider({ children }: { children: React.ReactNode }) {
    return (
        <TanStackProvider>
            <main className="max-w-8xl mx-auto w-full h-full">
                <AuthInitializer />
                {children}
                <ReactToast />
            </main>
        </TanStackProvider>
    );
}

export default MainProvider;