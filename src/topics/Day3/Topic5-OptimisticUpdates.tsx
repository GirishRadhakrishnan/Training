// DAY 3 · TOPIC 5: Optimistic updates
//
// Optimistic = update the screen first, assume the server will agree, and undo the
// change if it does not. The UI feels instant. Three callbacks do the work:
//   onMutate  runs BEFORE the request: cancelQueries (so an old refetch cannot
//             overwrite our change), snapshot the cache, setQueryData to the new
//             value, and return the snapshot as context.
//   onError   puts the snapshot back (rollback) and tells the user.
//   onSettled invalidates, so the screen finally matches the server either way.
//
// Tick "Make the next cancel fail" to see the row flip to Cancelled, wait 1.5 s,
// and roll back to Pending with an error message. The request is slowed to 1.5 s
// so you can see both steps.

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeaveRequest } from "../../types";
import { formatRange } from "../../lib/leave";
import { getLeaves, updateLeaveStatus } from "../../api/leaves";

const KEY = ["leaves"];

export default function OptimisticUpdates() {
  const queryClient = useQueryClient();
  const [failNext, setFailNext] = useState(false);

  const leaves = useQuery({ queryKey: KEY, queryFn: ({ signal }) => getLeaves({}, undefined, signal) });

  const cancel = useMutation({
    mutationFn: ({ id, fail }: { id: number; fail: boolean }) =>
      updateLeaveStatus(id, "Cancelled", { delay: 1500, fail }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<LeaveRequest[]>(KEY);
      queryClient.setQueryData<LeaveRequest[]>(KEY, (old) =>
        old?.map((leave) => (leave.id === id ? { ...leave, status: "Cancelled" } : leave)),
      );
      return { previous }; // available as context in onError
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(KEY, context?.previous); // rollback
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return (
    <div>
      <h2>Optimistic updates</h2>
      <label>
        <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} /> Make
        the next cancel fail
      </label>
      <div className="demo">
        {leaves.isPending && <p className="muted">Loading leave requests…</p>}
        {leaves.isError && <p className="message error">Could not load leave requests: {leaves.error.message}</p>}
        {leaves.data?.length === 0 && <p>You have no leave requests yet.</p>}
        {leaves.data?.map((leave) => (
          <div className="card row" key={leave.id}>
            <span>
              {leave.type}, {formatRange(leave.startDate, leave.endDate)}
            </span>
            <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
            {leave.status === "Pending" && (
              <button className="danger" onClick={() => cancel.mutate({ id: leave.id, fail: failNext })}>
                Cancel request
              </button>
            )}
          </div>
        ))}
        {cancel.isError && (
          <p className="message error" role="alert">
            Could not cancel the request, so it is Pending again: {cancel.error.message}
          </p>
        )}
      </div>
      <p className="note">
        No pending requests left? Restart npm run dev to reset the mock data, or create one in
        topic 4.
      </p>
      <p className="try">
        Try it: cancel a request with the box ticked, then unticked. Remove the onError rollback
        and try again: what does the screen show during the 1.5 s, and after the refetch?
      </p>
    </div>
  );
}
