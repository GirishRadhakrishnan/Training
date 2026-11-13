// DAY 3 · TOPIC 4: Calling an API from a component with fetch
//
// Both components below are the same "Employee leave requests" card. Same API (GET /api/leaves),
// same table, same "Load employee leave requests" button. The ONLY difference is where fetch is called.
//
// a) WITHOUT useEffect: fetch sits directly in the component body.
//    The body runs whenever React renders this component. So:
//      1. The first render after the click starts a request.
//      2. When the response arrives, setLeaves updates the state.
//      3. A state update causes another render.
//      4. That render starts another request.
//      5. Its response updates the state again: a request cycle that never stops.
//    There is no cap here. Watch the counter and the Network tab, then press Stop rendering to stop it.
//    (In dev, StrictMode runs the body twice per render, so you may see two requests each time.)
//
// b) WITH useEffect: the call lives in useEffect(() => {...}, [wanted]).
//    React runs it after a render only when wanted changed. One click, one request.
//    Rule: rendering only calculates the screen. Network calls go in an effect or an event handler.
//
// fetch() only rejects when the network fails. A 404 or 500 still "succeeds",
// so check response.ok yourself. This manual way is what TanStack Query replaces next.

import { useEffect, useState } from "react";
import type { LeaveRequest } from "../../types";
import { formatRange } from "../../lib/leave";

// Counts calls for the demo only (shown on screen)
const sent = { withoutEffect: 0, withEffect: 0 };

function LeaveTable({ leaves }: { leaves: LeaveRequest[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Type</th>
          <th>Dates</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map((leave) => (
          <tr key={leave.id}>
            <td>{leave.employee}</td>
            <td>{leave.type}</td>
            <td>{formatRange(leave.startDate, leave.endDate)}</td>
            <td>
              <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// a) WITHOUT useEffect: fetch in the component body
function MyLeavesWithoutEffect() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [wanted, setWanted] = useState(false);

  if (wanted) {
    // Runs on EVERY render once the button was clicked
    sent.withoutEffect += 1;
    fetch("/api/leaves")
      .then((response) => response.json())
      .then((data: LeaveRequest[]) => setLeaves(data)); // new array = state change = render = fetch again
  }

  return (
    <div>
      <button
        disabled={wanted}
        onClick={() => {
          sent.withoutEffect = 0;
          setWanted(true);
        }}
      >
        Load employee leave requests
      </button>
      <p>
        Requests sent: <b>{sent.withoutEffect}</b>
      </p>
      {wanted && leaves === null && <p>Loading employee leave requests…</p>}
      {leaves !== null && <LeaveTable leaves={leaves} />}
    </div>
  );
}

// b) WITH useEffect: fetch runs once per click
function MyLeavesWithEffect() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [wanted, setWanted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // if (wanted) {
  //   // Runs on EVERY render once the button was clicked
  //   sent.withoutEffect += 1;
  //   fetch("/api/leaves")
  //     .then((response) => response.json())
  //     .then((data: LeaveRequest[]) => setLeaves(data)); // new array = state change = render = fetch again
  // }

  useEffect(() => {
    if (!wanted) return;
    sent.withEffect += 1;
    fetch("/api/leaves")
      .then((response) => {
        if (!response.ok) throw new Error(`Server answered ${response.status}`);
        return response.json();
      })
      .then((data: LeaveRequest[]) => setLeaves(data))
      .catch((err: Error) => setError(err.message));
  }, [wanted]); // runs after render, only when wanted changes

  return (
    <div>
      <button
        disabled={wanted}
        onClick={() => {
          sent.withEffect = 0;
          setWanted(true);
        }}
      >
        Load employee leave requests
      </button>
      <p>
        Requests sent: <b>{sent.withEffect}</b>
      </p>
      {error && <p role="alert">Could not load employee leave requests: {error}</p>}
      {wanted && leaves === null && !error && <p>Loading employee leave requests…</p>}
      {leaves !== null && <LeaveTable leaves={leaves} />}
    </div>
  );
}

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  const [shown, setShown] = useState(true);
  const [attempt, setAttempt] = useState(0);

  return (
    <div className="demo">
      <h3>{title}</h3>
      {shown ? (
        <>
          <button onClick={() => setShown(false)}>Stop rendering (stops any requests)</button>
          <div key={attempt}>{children}</div>
        </>
      ) : (
        <button
          onClick={() => {
            setAttempt((n) => n + 1);
            setShown(true);
          }}
        >
          Render component again
        </button>
      )}
    </div>
  );
}

export default function FetchInAComponent() {
  return (
    <div>
      <Demo title="a) Without useEffect: fetch in the component body">
        <MyLeavesWithoutEffect />
      </Demo>
      <Demo title="b) With useEffect: fetch runs once">
        <MyLeavesWithEffect />
      </Demo>

    </div>
  );
}
