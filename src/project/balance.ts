import { ALLOWANCE, daysByStatus } from "../lib/leave";
import type { LeaveRequest, LeaveType } from "../types";

// Days left in one calendar year. Calculated every time from the list, never stored.
// Pending and Approved requests use up the balance; Rejected and Cancelled do not.
// null means "no limit" (Flexi). The server applies the same rule (server/mockApi.ts).
export function daysLeft(leaves: LeaveRequest[], type: LeaveType, year: string): number | null {
  const limit = ALLOWANCE[type];
  if (limit === null) return null;
  const thisYear = leaves.filter((leave) => leave.startDate.startsWith(year));
  return limit - daysByStatus(thisYear, type, "Approved") - daysByStatus(thisYear, type, "Pending");
}

export const dayWord = (n: number) => (n === 1 ? "day" : "days");
