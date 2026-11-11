// DAY 3 · TOPIC 1: Why TanStack Query
//
// REST primer. The server owns resources, each with a URL: /api/leaves (the list)
// and /api/leaves/3 (one request). The HTTP method says what to do:
//   GET read | POST create | PATCH change part of it | DELETE remove.
// The status code says how it went: 200 OK, 201 Created, 400 bad input,
// 404 not found, 500 server error. Data travels as JSON.
//
// Careful: fetch() only fails when the network is down. A 404 or 500 still
// "succeeds", so our helpers in src/api/leaves.ts check response.ok and throw.
//
// Part a) is the manual way (Day 2 useEffect): three useStates, a cleanup, a
// race to think about. It has no cache, no refetch, no retry.
// Part b) is the same screen with useQuery: about 5 lines.

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeaveRequest } from "../../types";
import { getLeaves } from "../../api/leaves";

function LeaveList({ leaves }: { leaves: LeaveRequest[] }) {
  return (
    <ul>
      {leaves.map((leave) => (
        <li key={leave.id}>
          {leave.employee}: {leave.type} <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
        </li>
      ))}
    </ul>
  );
}

function ManualWay() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AbortController cancels the request if we leave the screen (or StrictMode re-runs)
    const controller = new AbortController();
    getLeaves({}, undefined, controller.signal)
      .then(setLeaves)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) return <p className="muted">Loading leave requests…</p>;
  if (error) return <p className="message error">Could not load leave requests: {error}</p>;
  return <LeaveList leaves={leaves} />;
}

function QueryWay() {
  const { data, isPending, error } = useQuery({
    queryKey: ["leaves"],
    queryFn: ({ signal }) => getLeaves({}, undefined, signal),
  });

  if (isPending) return <p className="muted">Loading leave requests…</p>;
  if (error) return <p className="message error">Could not load leave requests: {error.message}</p>;
  return <LeaveList leaves={data} />;
}

export default function WhyTanStackQuery() {
  return (
    <div>
      <h2>Why TanStack Query</h2>
      <div className="cols-2">
        <div>
          <h3>a) Manual: useEffect + 3 useStates</h3>
          <div className="demo">
            <ManualWay />
          </div>
          <p className="note">
            Boilerplate, a cleanup to remember, no cache (leave and come back: it loads again),
            no refetch, no retry.
          </p>
        </div>
        <div>
          <h3>b) useQuery</h3>
          <div className="demo">
            <QueryWay />
          </div>
          <p className="note">
            Loading, error, cache, cancel and de-duplication are handled. Switch to another topic
            and come back: the data shows at once.
          </p>
        </div>
      </div>
      <p className="try">
        Try it: add ?fail=1 to the request by passing {"{ fail: true }"} as the second argument
        of getLeaves in both parts. Which part shows the error with less code?
      </p>
    </div>
  );
}
