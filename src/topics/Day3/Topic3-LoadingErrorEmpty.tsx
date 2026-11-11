// DAY 3 · TOPIC 3: Loading, error and empty states
//
// Every screen that shows server data has FOUR outcomes, not one:
//   loading  -> say what is loading ("Loading your leave requests…")
//   error    -> show the real reason and a Retry button, not "Something went wrong"
//   empty    -> say what is missing and what to do ("You have no leave requests yet")
//   data     -> the normal list
//
// isPending: there is no data yet (first load). Show the skeleton.
// isFetching: a request is running right now, even when data is already on screen.
// A background refresh should NOT replace the list with a spinner.
//
// The buttons below add ?delay, ?fail and ?empty to the request, so you can see
// each state on demand. In real code the server decides, not the user.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Simulate } from "../../api/leaves";
import { getLeaves } from "../../api/leaves";
import { formatRange } from "../../lib/leave";

const modes: Record<string, Simulate> = {
  Normal: {},
  "Slow (3 s)": { delay: 3000 },
  "Server error": { fail: true },
  "No data": { empty: true },
};

export default function LoadingErrorEmpty() {
  const [mode, setMode] = useState("Normal");

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["leaves", "states", mode],
    queryFn: ({ signal }) => getLeaves({}, modes[mode], signal),
    staleTime: 0, // always refetch, so each button click is visible
  });

  return (
    <div>
      <h2>Loading, error and empty</h2>
      <div className="row" role="group" aria-label="Simulate the server">
        {Object.keys(modes).map((name) => (
          <button key={name} className={name === mode ? "primary" : ""} onClick={() => setMode(name)}>
            {name}
          </button>
        ))}
        <button onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </button>
      </div>
      <div className="demo" aria-busy={isFetching}>
        <p className="muted">
          isPending: {String(isPending)} · isFetching: {String(isFetching)}
          {!isPending && isFetching && " (refreshing in the background)"}
        </p>
        {isPending && (
          <div role="status" aria-label="Loading your leave requests">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <p className="muted">Loading your leave requests…</p>
          </div>
        )}
        {isError && (
          <div className="message error" role="alert">
            <p>Could not load your leave requests: {error.message}</p>
            <button onClick={() => refetch()}>Retry</button>
          </div>
        )}
        {data && data.length === 0 && (
          <p>You have no leave requests yet. Use "Apply for leave" to create one.</p>
        )}
        {data && data.length > 0 && (
          <ul>
            {data.map((leave) => (
              <li key={leave.id}>
                {leave.type}, {formatRange(leave.startDate, leave.endDate)}:{" "}
                <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="note">
        Slow, then Normal: the cache entry for Normal exists, so the list stays on screen while
        isFetching is true. Only a key with no data yet shows the skeleton.
      </p>
      <p className="try">
        Try it: change the error text to include the word "retry later". Then make the empty
        state show a link-like button "Apply for leave" instead of plain text.
      </p>
    </div>
  );
}
