import { Link, useParams } from "react-router";
import { ApiError } from "../../api/leaves";
import { can } from "../../lib/permissions";
import { useAuth } from "../auth/AuthContext";
import { useChangeStatus, useLeave } from "../api/leaves";
import LeaveCard from "../components/LeaveCard";
import { LoadError, Loading } from "../components/Status";

export default function LeaveDetail() {
  const { user } = useAuth();
  const { id } = useParams(); // always a string (or undefined): convert it
  const leaveId = Number(id);
  const valid = Number.isInteger(leaveId) && leaveId > 0;

  const leave = useLeave(leaveId, valid); // enabled: false stops a request for "abc"
  const change = useChangeStatus();
  const back = <Link to="/leaves">Back to My leaves</Link>;

  if (!valid) return <p className="message error">"{id}" is not a valid request number. {back}</p>;
  if (leave.isPending) return <Loading what={`request ${leaveId}`} />;
  if (leave.error instanceof ApiError && leave.error.status === 404) {
    // The server also answers 404 for other people's requests, so ids cannot be guessed
    return <p className="message error">Request {leaveId} was not found. {back}</p>;
  }
  if (leave.isError) return <LoadError what={`request ${leaveId}`} error={leave.error} onRetry={() => leave.refetch()} />;

  return (
    <div>
      <h1>Request {leave.data.id}</h1>
      <LeaveCard leave={leave.data} showEmployee>
        {can(user, "cancel", leave.data) && (
          <button className="danger" onClick={() => change.mutate({ id: leave.data.id, status: "Cancelled" })}>Cancel request</button>
        )}
      </LeaveCard>
      {change.isError && <p className="message error" role="alert">Could not cancel the request, so it is Pending again: {change.error.message}</p>}
      {back}
    </div>
  );
}
