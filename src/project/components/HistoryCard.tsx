import { Link, useSearchParams } from "react-router";
import { LEAVE_STATUSES, LEAVE_TYPES, formatRange, workingDays } from "../../lib/leave";
import { can } from "../../lib/permissions";
import type { LeaveRequest } from "../../types";
import { useAuth } from "../auth/AuthContext";
import { useChangeStatus } from "../api/leaves";
import { Empty } from "./Status";

// The three filters live in the URL (?year=2026&type=Sick&status=Pending), so a refresh or a
// shared link shows the same table. Junk values in the URL are ignored (they mean "All").
export default function HistoryCard({ leaves }: { leaves: LeaveRequest[] }) {
  const { user } = useAuth();
  const cancel = useChangeStatus();
  const [params, setParams] = useSearchParams();

  const years = [...new Set(leaves.map((leave) => leave.startDate.slice(0, 4)))].sort().reverse();
  const year = years.find((y) => y === params.get("year"));
  const type = LEAVE_TYPES.find((t) => t === params.get("type"));
  const status = LEAVE_STATUSES.find((s) => s === params.get("status"));

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next);
  }

  // Newest first. Sorted on a copy, because sort changes its array.
  const rows = [...leaves]
    .sort((a, b) => b.id - a.id)
    .filter((l) => !year || l.startDate.startsWith(year))
    .filter((l) => !type || l.type === type)
    .filter((l) => !status || l.status === status);

  return (
    <section className="lv-card lv-history" aria-labelledby="history-title">
      <div className="lv-history-head">
        <h3 id="history-title">Leave history</h3>
        <div className="row">
          <select aria-label="Year" value={year ?? ""} onChange={(e) => setFilter("year", e.target.value)}>
            <option value="">All years</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select aria-label="Type" value={type ?? ""} onChange={(e) => setFilter("type", e.target.value)}>
            <option value="">All types</option>
            {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select aria-label="Status" value={status ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            {LEAVE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {leaves.length === 0 && <Empty>You have not applied for any leave yet. Use the form above.</Empty>}
      {leaves.length > 0 && rows.length === 0 && <Empty>No requests match these filters. Change a filter to see more.</Empty>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr><th>Type</th><th>Date range</th><th>Days</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map((leave) => (
              <tr key={leave.id}>
                <td><Link to={`/leaves/${leave.id}`}>{leave.type} leave</Link></td>
                <td>{formatRange(leave.startDate, leave.endDate)}</td>
                <td>{workingDays(leave.startDate, leave.endDate)}</td>
                <td><span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                <td>
                  {/* Optimistic: the row flips to Cancelled at once and rolls back if the server says no */}
                  {can(user, "cancel", leave) && (
                    <button className="danger" onClick={() => cancel.mutate({ id: leave.id, status: "Cancelled" })}
                      aria-label={`Cancel request ${leave.id}`}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {cancel.isError && <p className="message error" role="alert">Could not cancel the request, so it is Pending again: {cancel.error.message}</p>}
    </section>
  );
}
