"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRef, type Dispatch, type SetStateAction } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/validators/auth.schema";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { UserRow } from "./types";
import { UserActionsMenu } from "./UserActionsMenu";

type UsersProps = {
    filterRole: string | null;
    setFilterRole: Dispatch<SetStateAction<string | null>>;
    isLoadingUsers?: boolean;
    isUsersError?: boolean;
    usersError?: Error | null;
    rowsToRender?: UserRow[];
};

function UsersPage({ ...props }: UsersProps) {
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    // GSAP animation
    useGSAP(
        () => {
            if (!tableBodyRef.current) return;

            const rows = tableBodyRef.current.querySelectorAll("tr");

            gsap.fromTo(
                rows,
                {
                    opacity: 0,
                    y: 18,
                    filter: "blur(8px)",
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.55,
                    stagger: 0.06,
                    ease: "power3.out",
                }
            );
        },
        {
            dependencies: [props.rowsToRender], // animate on new rows
            scope: tableBodyRef, // GSAP handles cleanup automatically
        }
    );

    return (
        <section className="grid gap-6 lg:grid-cols-[1fr]">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage roles, invites, and status</CardDescription>
                    </div>

                    <Select
                        value={props.filterRole ?? undefined}
                        onValueChange={(value) =>
                            props.setFilterRole(value === "all" ? null : value)
                        }
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.values(ROLES).map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.replace("_", " ").toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Last Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        {/* GSAP Animation Target */}
                        <TableBody ref={tableBodyRef}>
                            {props.isLoadingUsers &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={`sk-${i}`}>
                                        <TableCell colSpan={5}>
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-1/3" />
                                                    <Skeleton className="h-3 w-1/4" />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!props.isLoadingUsers &&
                                !props.isUsersError &&
                                props.rowsToRender?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 text-sm">
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(" ")
                                                            .map((c) => c[0])
                                                            .slice(0, 2)
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium leading-none">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="secondary">{user.roleLabel}</Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                className={cn("text-xs font-medium", user.status.className)}
                                            >
                                                {user.status.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                            {user.lastActive}
                                        </TableCell>


                                        <TableCell className="text-right">
                                            <UserActionsMenu
                                                user={user}

                                                onBan={() => { }}
                                                onDelete={() => { }}
                                                onView={() => { }}
                                            />
                                        </TableCell>


                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}

export default UsersPage;


