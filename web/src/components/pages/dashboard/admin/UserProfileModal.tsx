"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ShieldCheck, UserRound } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { UserRow } from "./types";

let gsapRegistered = false;
if (typeof window !== "undefined" && !gsapRegistered) {
    gsap.registerPlugin(useGSAP);
    gsapRegistered = true;
}

type UserProfileModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserRow;
};

function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
    type InfoItem = { label: string; value: ReactNode };
    const [activeTab, setActiveTab] = useState("info");
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const tabPanelsRef = useRef<Record<string, HTMLDivElement | null>>({});

    useGSAP(
        () => {
            if (!open || !dialogContentRef.current) return;
            const target = dialogContentRef.current;
            gsap.fromTo(
                target,
                { opacity: 0, y: 16, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
            );
            gsap.fromTo(
                target.querySelectorAll("[data-animate='section']"),
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 }
            );
        },
        { dependencies: [open], scope: dialogContentRef }
    );


    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setActiveTab("info");
        }
        onOpenChange(nextOpen);
    };

    useEffect(() => {
        if (!open) return;
        const panel = tabPanelsRef.current[activeTab];
        if (!panel) return;
        const children = Array.from(panel.children);
        if (!children.length) return;
        gsap.fromTo(
            children,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.06 }
        );
    }, [activeTab, open]);

    const registerTabPanel = (key: string) => (node: HTMLDivElement | null) => {
        tabPanelsRef.current[key] = node;
    };

    const formatDate = (value?: string) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const derivedRolePermissions = useMemo(
        () => user.rolePermissions ?? user.sourceUser?.rolePermissions ?? [],
        [user.rolePermissions, user.sourceUser?.rolePermissions]
    );

    const derivedCustomPermissions = useMemo(
        () => user.customPermissions ?? user.sourceUser?.customPermissions ?? [],
        [user.customPermissions, user.sourceUser?.customPermissions]
    );

    const derivedEffectivePermissions = useMemo(() => {
        if (user.effectivePermissions && user.effectivePermissions.length) return user.effectivePermissions;
        if (user.permissions && user.permissions.length) return user.permissions;
        if (user.sourceUser?.effectivePermissions && user.sourceUser.effectivePermissions.length) {
            return user.sourceUser.effectivePermissions;
        }
        return [...new Set([...derivedRolePermissions, ...derivedCustomPermissions])];
    }, [
        user.effectivePermissions,
        user.permissions,
        user.sourceUser?.effectivePermissions,
        derivedRolePermissions,
        derivedCustomPermissions,
    ]);

    const accountCreatedAt = user.sourceUser?.createdAt ?? user.sourceUser?.updatedAt;
    const timezoneGuess = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const roleDescription = user.roleDescription ?? user.sourceUser?.roleId?.description ?? "No description provided";

    const activeRoles = useMemo(
        () => [
            {
                name: user.roleLabel || user.sourceUser?.roleId?.name || "Unknown role",
                description: roleDescription,
                assigned: formatDate(user.sourceUser?.createdAt),
            },
        ],
        [user.roleLabel, user.sourceUser?.roleId?.name, roleDescription, user.sourceUser?.createdAt]
    );

    const normalizedStatus = user.status?.label?.toLowerCase() ?? "unknown";
    const statusBadgeClass: Record<string, string> = {
        active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        "pending approval": "border-amber-200 bg-amber-50 text-amber-700",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        banned: "border-rose-200 bg-rose-50 text-rose-700",
    };

    const infoItems: InfoItem[] = [
        { label: "User ID", value: user.id },
        { label: "Full Name", value: user.name },
        { label: "Email", value: user.email },
        { label: "Role", value: user.roleLabel },
        {
            label: "Status",
            value: (
                <Badge
                    variant="outline"
                    className={cn(
                        "px-2 py-0.5 text-xs font-semibold capitalize",
                        "border border-input/70",
                        statusBadgeClass[normalizedStatus] ?? "border-muted bg-muted text-muted-foreground"
                    )}
                >
                    {user.status?.label ?? "Unknown"}
                </Badge>
            ),
        },
        { label: "Last Active", value: user.lastActive },
        { label: "Created", value: formatDate(accountCreatedAt) },
        { label: "Timezone", value: timezoneGuess ?? "UTC" },
    ];

    const permissionCollections = [
        {
            title: "Role permissions",
            description: "Inherited from the assigned role",
            permissions: derivedRolePermissions,
            emptyLabel: "Role has no mapped permissions",
        },
        {
            title: "Custom overrides",
            description: "Explicit overrides applied to this user",
            permissions: derivedCustomPermissions,
            emptyLabel: "No custom overrides",
        },
        {
            title: "Effective permissions",
            description: "Final union sent by the backend",
            permissions: derivedEffectivePermissions,
            emptyLabel: "No active permissions",
        },
    ];

    const debuggerPayload = user.sourceUser ?? user;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                ref={dialogContentRef}
                className="flex max-h-[85vh] flex-col overflow-y-scroll border border-border/70 bg-background/95 shadow-2xl backdrop-blur sm:max-w-2xl"
            >
                <DialogHeader data-animate="section">
                    <DialogTitle>User profile</DialogTitle>
                    <DialogDescription>
                        A quick snapshot of account details and current access levels.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex h-full flex-col">
                    <TabsList
                        data-animate="section"
                        className="w-full justify-start gap-2 rounded-none border-none bg-transparent p-0"
                    >
                        <TabsTrigger
                            value="info"
                            className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
                        >
                            <UserRound className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
                            User Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="access"
                            className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-foreground"
                        >
                            <ShieldCheck className="h-4 w-4 text-muted-foreground group-data-[state=active]:text-primary" />
                            Permissions & Roles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-4 flex-1 overflow-auto">
                        <div
                            ref={registerTabPanel("info")}
                            className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4"
                        >
                            <div>
                                <p className="text-sm text-muted-foreground">Display Name</p>
                                <p className="text-lg font-semibold text-foreground">{user.name ?? user.email}</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {infoItems.map((item) => (
                                    <div key={item.label} className="rounded-xl border border-input/60 bg-background/80 p-3 text-sm shadow-sm">
                                        <p className="text-muted-foreground">{item.label}</p>
                                        <p className="font-medium text-foreground">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="access" className="mt-4 flex-1 overflow-auto">
                        <div
                            ref={registerTabPanel("access")}
                            className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4"
                        >
                            <div>
                                <p className="text-sm font-semibold">Active Roles</p>
                                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                    {activeRoles.map((role) => (
                                        <div key={role.name} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm">
                                            <p className="font-medium">{role.name}</p>
                                            <p className="text-muted-foreground text-xs">{role.description}</p>
                                            <p className="text-[11px] text-muted-foreground">Assigned {role.assigned}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Scoped Permissions</p>
                                <div className="mt-2 grid gap-3">
                                    {permissionCollections.map((collection) => (
                                        <div key={collection.title} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm shadow-sm">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium">{collection.title}</p>
                                                <p className="text-[11px] text-muted-foreground">{collection.description}</p>
                                            </div>
                                            {collection.permissions.length ? (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {collection.permissions.map((permission) => (
                                                        <Badge
                                                            key={`${collection.title}-${permission}`}
                                                            variant="outline"
                                                            className="border-primary/30 bg-background text-primary"
                                                        >
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-xs text-muted-foreground">{collection.emptyLabel}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <details className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3 text-sm" data-animate="section">
                                <summary className="cursor-pointer font-semibold">Permission debugger</summary>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Snapshot of the raw payload returned by the backend for this user.
                                </p>
                                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs text-left">
                                    {JSON.stringify(debuggerPayload, null, 2)}
                                </pre>
                            </details>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default UserProfileModal;