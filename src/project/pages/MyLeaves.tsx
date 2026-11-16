import { Link, useSearchParams } from "react-router";
import { ALLOWANCE, LEAVE_STATUSES, LEAVE_TYPES, daysByStatus } from "../../lib/leave";
import { can } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { useChangeStatus, useMyLeaves } from "../api/leaves";
import LeaveCard from "../components/LeaveCard";
import { Empty, LoadError, Loading } from "../components/Status";

export default function MyLeaves() {
  const { user } = useAuth();
  const leaves = useMyLeaves();
  const cancel = useChangeStatus();

  // The filter lives in the URL (?status=Pending), so refresh and shared links keep it.
  const [params, setParams] = useSearchParams();
  const status = LEAVE_STATUSES.find((s) => s === params.get("status")); // ignore junk values

  if (leaves.isPending) return <Loading what="your leave requests" />;
  if (leaves.isError) return <LoadError what="your leave requests" error={leaves.error} onRetry={() => leaves.refetch()} />;

  const all = leaves.data;
  const visible = status ? all.filter((leave) => leave.status === status) : all;

  return (
    <div>
      <h1>My leaves</h1>

      {/* Balances are CALCULATED from the list every render, never stored. */}
      <div className="pj-balances">
        {LEAVE_TYPES.map((type) => {
          const approved = daysByStatus(all, type, "Approved");
          const pending = daysByStatus(all, type, "Pending");
          const limit = ALLOWANCE[type];
          return (
            <div className="card" key={type}>
              <h3>{type}</h3>
              <p>{limit === null ? `${approved} days taken (no limit)` : `${limit - approved - pending} of ${limit} days left`}</p>
              <p className="muted">{approved} approved, {pending} pending</p>
            </div>
          );
        })}
      </div>

      <div className="row pj-toolbar">
        <label>
          Status{" "}
          <select value={status ?? ""} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}>
            <option value="">All</option>
            {LEAVE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <span className="muted">{visible.length} of {all.length} requests</span>
        <Link to="/leaves/new" className="pj-button">Apply for leave</Link>
      </div>

      {all.length === 0 && <Empty>You have no leave requests yet. Apply for your first leave.</Empty>}
      {all.length > 0 && visible.length === 0 && <Empty>You have no {status} requests.</Empty>}
      {visible.map((leave) => (
        <LeaveCard key={leave.id} leave={leave}>
          {can(user, "cancel", leave) && (
            <button className="danger" onClick={() => cancel.mutate({ id: leave.id, status: "Cancelled" })}>Cancel request</button>
          )}
        </LeaveCard>
      ))}
      {cancel.isError && <p className="message error" role="alert">Could not cancel the request, so it is Pending again: {cancel.error.message}</p>}
    </div>
  );
}
