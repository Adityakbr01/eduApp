"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usersMutations } from "@/services/users/index";
import { CheckCircle, MoreVertical, ShieldBan, Trash2, User } from "lucide-react";
import type { UserRow } from "./types";

type UserActionsMenuProps = {
    user: UserRow;
    onView: () => void;

};

export function UserActionsMenu({ user, onView }: UserActionsMenuProps) {
    const approveMutation = usersMutations.useApproveUser();
    const banMutation = usersMutations.useBanUser();
    const deleteMutation = usersMutations.useDeleteUser();

    const handleApprove = () => {
        approveMutation.mutate({ userId: user.id });
    };

    const isApproved =
        user.status.label.toLowerCase() === "pending approval".toLowerCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 bg-background">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem onClick={onView}>
                    <User className="mr-2 h-4 w-4" />
                    User Profile
                </DropdownMenuItem>

                {isApproved && (
                    <DropdownMenuItem
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {approveMutation.isPending ? "Approving..." : "Approve"}
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => banMutation.mutate({ userId: user.id })} disabled={banMutation.isPending}>
                    <ShieldBan className="mr-2 h-4 w-4" />
                    {banMutation.isPending ? user.status.label : user.status.label.toLowerCase() === "banned" ? "Unban User" : "Ban User"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => deleteMutation.mutate(user.id)}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
