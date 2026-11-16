import type { ReactNode } from "react";
import { Link } from "react-router";
import type { LeaveRequest } from "../../types";
import { formatRange, workingDays } from "../../lib/leave";

// One leave request. Working days are calculated here, never stored.
// "children" is a slot for action buttons (cancel, approve, reject).
export default function LeaveCard({ leave, showEmployee, children }: { leave: LeaveRequest; showEmployee?: boolean; children?: ReactNode }) {
  const days = workingDays(leave.startDate, leave.endDate);
  return (
    <div className="card pj-leave">
      <div>
        <h3>
          {showEmployee && `${leave.employee}: `}
          <Link to={`/leaves/${leave.id}`}>{leave.type} leave</Link>{" "}
          <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
        </h3>
        <p>
          {formatRange(leave.startDate, leave.endDate)} ({days} working {days === 1 ? "day" : "days"})
        </p>
        <p className="muted">{leave.reason}</p>
      </div>
      <div className="row">{children}</div>
    </div>
  );
}
