import { useSearchParams } from "react-router";
import { LEAVE_STATUSES, LEAVE_TYPES } from "../../lib/leave";
import { can } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { useChangeStatus, useTeamLeaves } from "../api/leaves";
import LeaveCard from "../components/LeaveCard";
import { Empty, LoadError, Loading } from "../components/Status";

// Manager only (see RequireRole in routes.tsx). Even if an Employee got here, the server
// answers 403 to this request.
export default function TeamRequests() {
  const { user } = useAuth();
  const team = useTeamLeaves();
  const review = useChangeStatus();

  // Filters live in the URL (?employee=Asha Rao&type=Sick&status=Pending). Junk values mean "All".
  const [params, setParams] = useSearchParams();

  if (team.isPending) return <Loading what="team requests" />;
  if (team.isError) return <LoadError what="team requests" error={team.error} onRetry={() => team.refetch()} />;

  // The employee list is calculated from the data, never stored
  const employees = [...new Set(team.data.map((leave) => leave.employee))].sort();
  const employee = employees.find((name) => name === params.get("employee"));
  const type = LEAVE_TYPES.find((t) => t === params.get("type"));
  const status = LEAVE_STATUSES.find((s) => s === params.get("status"));

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next);
  }

  const shown = team.data
    .filter((leave) => !employee || leave.employee === employee)
    .filter((leave) => !type || leave.type === type)
    .filter((leave) => !status || leave.status === status);
  const pending = shown.filter((leave) => leave.status === "Pending");
  const decided = shown.filter((leave) => leave.status !== "Pending");

  return (
    <div>
      <h1>Team requests</h1>
      <div className="row pj-filters">
        <select aria-label="Employee" value={employee ?? ""} onChange={(e) => setFilter("employee", e.target.value)}>
          <option value="">All employees</option>
          {employees.map((name) => <option key={name}>{name}</option>)}
        </select>
        <select aria-label="Type" value={type ?? ""} onChange={(e) => setFilter("type", e.target.value)}>
          <option value="">All types</option>
          {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Status" value={status ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">All statuses</option>
          {LEAVE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="muted">{shown.length} of {team.data.length} requests</span>
      </div>

      {team.data.length === 0 && <Empty>Nobody on your team has sent a leave request yet.</Empty>}
      {team.data.length > 0 && shown.length === 0 && <Empty>No requests match these filters. Change a filter to see more.</Empty>}

      {shown.length > 0 && (
        <>
          <h2>Waiting for a decision ({pending.length})</h2>
          {pending.length === 0 && <Empty>No matching requests are waiting for you.</Empty>}
          {pending.map((leave) => (
            <LeaveCard key={leave.id} leave={leave} showEmployee>
              {can(user, "approve", leave) && (
                <button className="primary" onClick={() => review.mutate({ id: leave.id, status: "Approved" })}>Approve</button>
              )}
              {can(user, "reject", leave) && (
                <button className="danger" onClick={() => review.mutate({ id: leave.id, status: "Rejected" })}>Reject</button>
              )}
            </LeaveCard>
          ))}
          {review.isError && <p className="message error" role="alert">Could not save your decision, so the request is Pending again: {review.error.message}</p>}
          <h2>Decided ({decided.length})</h2>
          {decided.length === 0 && <Empty>No matching requests have been decided yet.</Empty>}
          {decided.map((leave) => <LeaveCard key={leave.id} leave={leave} showEmployee />)}
        </>
      )}
    </div>
  );
}
