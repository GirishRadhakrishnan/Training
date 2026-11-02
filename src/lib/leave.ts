import type { LeaveRequest, LeaveStatus, LeaveType } from "../types";

export const LEAVE_TYPES: LeaveType[] = ["Annual", "Sick", "Casual", "Unpaid"];

export const LEAVE_STATUSES: LeaveStatus[] = ["Pending", "Approved", "Rejected", "Cancelled"];

// null means no limit
export const ALLOWANCE: Record<LeaveType, number | null> = {
  Annual: 18,
  Sick: 10,
  Casual: 6,
  Unpaid: null,
};

// "YYYY-MM-DD" -> local midnight, so the date never shifts with the time zone
function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

// Monday to Friday between two "YYYY-MM-DD" dates, both included
export function workingDays(start: string, end: string): number {
  const day = parseDate(start);
  const last = parseDate(end);
  let count = 0;
  while (day <= last) {
    const weekday = day.getDay();
    if (weekday !== 0 && weekday !== 6) count++;
    day.setDate(day.getDate() + 1);
  }
  return count;
}

export function daysByStatus(leaves: LeaveRequest[], type: LeaveType, status: LeaveStatus): number {
  return leaves
    .filter((leave) => leave.type === type && leave.status === status)
    .reduce((total, leave) => total + workingDays(leave.startDate, leave.endDate), 0);
}

// ISO dates compare correctly as text
export function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

// "16 Nov to 20 Nov 2026", or "16 Nov 2026" for a single day
export function formatRange(start: string, end: string): string {
  const withYear = (date: string) =>
    parseDate(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (start === end) return withYear(start);
  const withoutYear = parseDate(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const startText = start.slice(0, 4) === end.slice(0, 4) ? withoutYear : withYear(start);
  const endText = parseDate(end).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startText} to ${endText}`;
}
