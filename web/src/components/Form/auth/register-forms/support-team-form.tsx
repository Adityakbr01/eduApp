"use client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchemaInput } from "@/validators/auth.schema";
import { UseFormReturn } from "react-hook-form";

interface SupportTeamFormProps {
    form: UseFormReturn<RegisterSchemaInput>;
}

export function SupportTeamForm({ form }: SupportTeamFormProps) {
    return (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4">
            <h3 className="font-semibold text-slate-900">Support Team Information</h3>
            <FormField
                control={form.control}
                name="supportTeamProfile.shiftTimings"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Shift Timings *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., 9 AM - 5 PM"
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
                name="supportTeamProfile.expertiseAreas"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expertise Areas *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Technical, Billing (comma-separated)"
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