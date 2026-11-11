// DAY 3 · TOPIC 2: useQuery
//
// useQuery({ queryKey, queryFn }) reads server data and caches it.
//  - queryKey: the cache address. It must include every variable the queryFn uses,
//    e.g. ["leaves", { status }]. A new key = a new cache entry = a new request.
//  - queryFn: returns a promise of the data. Throw to signal an error.
//  - Result: data, isPending (no data yet), isError, error, isFetching (any request
//    in flight, including background refetches).
//  - staleTime: how long data counts as fresh. Fresh data is not refetched.
//    With the default 0, data is refetched on mount and when the window regains focus.
// Never copy data into useState. Read it from the query.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeaveStatus } from "../../types";
import { LEAVE_STATUSES, formatRange } from "../../lib/leave";
import { getLeaves } from "../../api/leaves";

export default function UseQuery() {
  const [status, setStatus] = useState<LeaveStatus | "All">("All");

  const { data, isPending, isFetching, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ["leaves", { status }],
    queryFn: ({ signal }) => getLeaves(status === "All" ? {} : { status }, undefined, signal),
    staleTime: 10_000, // 10 s: coming back to a filter within 10 s does not refetch
  });

  return (
    <div>
      <h2>useQuery</h2>
      <div className="demo">
        <div className="row">
          <label>
            Status{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option>All</option>
              {LEAVE_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <span className="muted">key: {JSON.stringify(["leaves", { status }])}</span>
        </div>
        <p>
          isPending: <b>{String(isPending)}</b> · isFetching: <b>{String(isFetching)}</b> ·
          isError: <b>{String(isError)}</b>
          {dataUpdatedAt > 0 && <> · fetched at {new Date(dataUpdatedAt).toLocaleTimeString("en-IN")}</>}
        </p>
        {isPending && <p className="muted">Loading leave requests…</p>}
        {isError && <p className="message error">Could not load leave requests: {error.message}</p>}
        {data && (
          <ul>
            {data.map((leave) => (
              <li key={leave.id}>
                {leave.employee}: {leave.type}, {formatRange(leave.startDate, leave.endDate)} (
                {leave.status})
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="note">
        Pick Approved, then All, then Approved again within 10 seconds. The second visit shows
        data instantly and does not fetch. After 10 seconds it shows the old data and refetches
        in the background (isFetching true, isPending false).
      </p>
      <p className="try">
        Try it: change staleTime to 0 and click another browser tab, then come back. Watch the
        "fetched at" time change: that is refetch on window focus.
      </p>
    </div>
  );
}
