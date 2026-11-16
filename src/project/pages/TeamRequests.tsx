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

  if (team.isPending) return <Loading what="team requests" />;
  if (team.isError) return <LoadError what="team requests" error={team.error} onRetry={() => team.refetch()} />;

  // Counts are calculated, never stored
  const pending = team.data.filter((leave) => leave.status === "Pending");
  const decided = team.data.filter((leave) => leave.status !== "Pending");

  return (
    <div>
      <h1>Team requests</h1>
      <h2>Waiting for a decision ({pending.length})</h2>
      {pending.length === 0 && <Empty>No requests are waiting for you. Nice work.</Empty>}
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
      {decided.length === 0 && <Empty>No requests have been decided yet.</Empty>}
      {decided.map((leave) => <LeaveCard key={leave.id} leave={leave} showEmployee />)}
    </div>
  );
}
