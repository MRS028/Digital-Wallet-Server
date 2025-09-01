//agent interface

import { IUser } from "../user/user.interface";

export enum agentStatus {
    ACTIVE = "active",
    PENDING = "pending",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    BLOCKED = "blocked"
}
export interface IAgent extends IUser{
    agentCode: string;
    status: agentStatus;
    commissionRate: number;
    approvalDate: Date;
    approvedBy: string;
}

