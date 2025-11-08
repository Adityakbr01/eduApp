"use client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchemaInput } from "@/validators/auth.schema";
import { UseFormReturn } from "react-hook-form";

interface ManagerFormProps {
    form: UseFormReturn<RegisterSchemaInput>;
}

export function ManagerForm({ form }: ManagerFormProps) {
    return (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
            <h3 className="font-semibold text-slate-900">Manager Information</h3>
            <FormField
                control={form.control}
                name="managerProfile.department"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Sales, Engineering"
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
                name="managerProfile.teamSize"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Team Size *</FormLabel>
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
        </div>
    );
}