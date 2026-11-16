import type { LeaveRequest, User } from "../types";

// What may this user do? The UI uses this to HIDE buttons. It is only a convenience:
// the server (server/mockApi.ts) repeats every rule and is the real security.
export type Action = "viewTeam" | "cancel" | "approve" | "reject";

export function can(user: User | null, action: Action, leave?: LeaveRequest): boolean {
  if (!user) return false;
  switch (action) {
    case "viewTeam":
      return user.role === "Manager";
    case "approve":
    case "reject":
      return user.role === "Manager" && leave?.status === "Pending";
    case "cancel":
      return leave?.employee === user.name && leave.status === "Pending";
  }
}
