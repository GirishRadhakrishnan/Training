// DAY 2 · TOPIC 8: useReducer
//
// useReducer is useState for state with several related fields and several ways
// to change it. Instead of many setters you write one reducer function:
//   (state, action) => newState
// and components call dispatch({ type: "...", ... }) to describe what happened.
//
// The reducer is a plain function: no side effects, never change `state` in place,
// always return a new object. TypeScript checks that every action is handled.
//
// Here one reducer drives a search box, two selects and a Reset button. The
// filtered list is derived during render, not stored.

import { useReducer } from "react";
import type { LeaveStatus, LeaveType } from "../../types";
import { LEAVE_STATUSES, LEAVE_TYPES, formatRange } from "../../lib/leave";
import { sampleLeaves } from "../../sample/leaves";

type Filters = {
  query: string;
  status: LeaveStatus | "All";
  type: LeaveType | "All";
};

type Action =
  | { type: "query"; value: string }
  | { type: "status"; value: Filters["status"] }
  | { type: "type"; value: Filters["type"] }
  | { type: "reset" };

const initialFilters: Filters = { query: "", status: "All", type: "All" };

function filterReducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "query":
      return { ...state, query: action.value };
    case "status":
      return { ...state, status: action.value };
    case "type":
      return { ...state, type: action.value };
    case "reset":
      return initialFilters;
  }
}

export default function UseReducer() {
  const [filters, dispatch] = useReducer(filterReducer, initialFilters);

  const query = filters.query.trim().toLowerCase();
  const visible = sampleLeaves.filter(
    (leave) =>
      (filters.status === "All" || leave.status === filters.status) &&
      (filters.type === "All" || leave.type === filters.type) &&
      (leave.employee.toLowerCase().includes(query) || leave.reason.toLowerCase().includes(query)),
  );

  return (
    <div>
      <h2>useReducer</h2>
      <div className="demo">
        <div className="row">
          <input
            type="search"
            aria-label="Search employee or reason"
            placeholder="Search employee or reason"
            value={filters.query}
            onChange={(e) => dispatch({ type: "query", value: e.target.value })}
          />
          <select
            aria-label="Status"
            value={filters.status}
            onChange={(e) =>
              dispatch({ type: "status", value: e.target.value as Filters["status"] })
            }
          >
            <option>All</option>
            {LEAVE_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            aria-label="Leave type"
            value={filters.type}
            onChange={(e) => dispatch({ type: "type", value: e.target.value as Filters["type"] })}
          >
            <option>All</option>
            {LEAVE_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
        </div>
        <p>
          {visible.length} of {sampleLeaves.length} requests
        </p>
        {visible.length === 0 ? (
          <p className="muted">No requests match these filters.</p>
        ) : (
          <ul>
            {visible.map((leave) => (
              <li key={leave.id}>
                {leave.employee}: {leave.type}, {formatRange(leave.startDate, leave.endDate)} (
                {leave.status}). {leave.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="try">
        Try it: search "fever", then set Status to Pending. Add a new action, "clearQuery",
        that empties only the search text. What must you change in the reducer and in the
        Action type?
      </p>
    </div>
  );
}
