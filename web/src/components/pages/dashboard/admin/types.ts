export type StatusMeta = {
    label: string;
    className: string;
};

export type UserRow = {
    id: string;
    name: string;
    email: string;
    roleLabel: string;
    status: StatusMeta;
    lastActive: string;
};
