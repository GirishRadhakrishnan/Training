export type LeaveType = "Annual" | "Sick" | "Casual" | "Flexi";

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export type LeaveRequest = {
  id: number;
  employee: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
};

export type NewLeave = Omit<LeaveRequest, "id" | "status">;
