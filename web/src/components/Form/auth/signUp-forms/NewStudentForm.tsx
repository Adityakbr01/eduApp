"use client";

import {
    registerSchema,
    type RegisterSchemaInput,
    ROLES
} from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

import ROUTES from "@/lib/CONSTANTS/ROUTES";
import { secureLocalStorage } from "@/lib/utils/encryption";
import authMutations from "@/services/auth/mutations";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";

type RegisterFormData = RegisterSchemaInput;

function NewStudentForm() {
    const [showPassword, setShowPassword] = useState(false);

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

    const register = authMutations.useRegister();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    });

    // Ensure form picks up restored values
    useEffect(() => {
        form.reset(initialValues);
        secureLocalStorage.setItem("authStep", "1");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    useEffect(() => {
        const subscription = form.watch((value) => {
            secureLocalStorage.setItem("registerFormData", value);
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: RegisterFormData) => {
        secureLocalStorage.setItem("registerData", data);
        secureLocalStorage.setItem("authStep", "2");
        await register.mutateAsync(data, {
            onSuccess: () => {
                router.push(ROUTES.AUTH.VERIFY_OTP);
            },
            onError: (error) => {
                if (error instanceof AxiosError && error.response) {
                    if (error.status === 409) {
                        router.push(ROUTES.AUTH.LOGIN);
                    }
                }
            }
        });
    };

    return (

        <>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        {...field}
                                        className="h-11 rounded-lg text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Email Address *
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        {...field}
                                        className="h-11 rounded-lg text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Password *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...field}
                                            className="h-11 rounded-lg text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                    Min 6 characters including uppercase, lowercase and numbers
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="9876543210"
                                        {...field}
                                        value={field.value || ""}
                                        className="h-11 rounded-lg text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="123 Main Street, City"
                                        {...field}
                                        value={field.value || ""}
                                        className="h-11 rounded-lg text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={register.isPending}
                        className="w-full h-11 font-semibold rounded-lg"
                    >
                        {register.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sign Up"}
                    </Button>
                </form>
            </Form>

        </>

    );
}

export default NewStudentForm;