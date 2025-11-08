"use client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchemaInput } from "@/validators/auth.schema";
import { UseFormReturn } from "react-hook-form";

interface InstructorFormProps {
    form: UseFormReturn<RegisterSchemaInput>;
}

export function InstructorForm({ form }: InstructorFormProps) {
    return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
            <h3 className="font-semibold text-slate-900">Instructor Information</h3>
            <FormField
                control={form.control}
                name="instructorProfile.bio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bio *</FormLabel>
                        <FormControl>
                            <textarea
                                placeholder="Tell us about yourself..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="instructorProfile.experience"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="1"
                                placeholder="5"
                                {...field}
                                onChange={(e) =>
                                    field.onChange(e.target.value ? Number(e.target.value) : "")
                                }
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="instructorProfile.expertise"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expertise Areas *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Mathematics, Physics (comma-separated)"
                                {...field}
                                value={field.value?.join(", ") || ""}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                    )
                                }
                            />
                        </FormControl>
                        <FormDescription>Separate multiple areas with commas</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}