// DAY 2 · TOPIC 4: Lifting state up
//
// When two components need the same state, move it to their closest common
// parent. The parent passes the value down as a prop and passes a function down
// so children can ask for a change.
//
// Here the parent owns the status filter. StatusFilter changes it, while Summary
// and LeaveTable only read it.
//
// The visible list is not a second state variable. It is calculated from the
// filter during render, so the list and the filter can never disagree.

import { useState } from "react";
import type { LeaveRequest, LeaveStatus } from "../../types";
import { LEAVE_STATUSES, formatRange } from "../../lib/leave";
import { sampleLeaves } from "../../sample/leaves";

type Filter = "All" | LeaveStatus;

const FILTERS: Filter[] = ["All", ...LEAVE_STATUSES];

type StatusFilterProps = {
  value: Filter;
  onChange: (filter: Filter) => void;
};

function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="row" role="group" aria-label="Filter by status">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          className={filter === value ? "primary" : undefined}
          aria-pressed={filter === value}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function Summary({ filter, count }: { filter: Filter; count: number }) {
  const label = filter === "All" ? "" : `${filter.toLowerCase()} `;
  return (
    <p>
      Showing {count} {label}request(s)
    </p>
  );
}

function LeaveTable({ leaves, filter }: { leaves: LeaveRequest[]; filter: Filter }) {
  if (leaves.length === 0) {
    return <p className="muted">No {filter.toLowerCase()} requests.</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Type</th>
          <th>Dates</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map((leave) => (
          <tr key={leave.id}>
            <td>{leave.employee}</td>
            <td>{leave.type}</td>
            <td>{formatRange(leave.startDate, leave.endDate)}</td>
            <td>
              <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LiftingStateUp() {
  const [filter, setFilter] = useState<Filter>("All");

  // Derived from state, not a second useState
  const visible =
    filter === "All" ? sampleLeaves : sampleLeaves.filter((leave) => leave.status === filter);

  return (
    <div>
      <h2>Lifting state up</h2>
      <div className="demo">
        <StatusFilter value={filter} onChange={setFilter} />
        <Summary filter={filter} count={visible.length} />
        <LeaveTable leaves={visible} filter={filter} />
      </div>
    </div>
  );
}
