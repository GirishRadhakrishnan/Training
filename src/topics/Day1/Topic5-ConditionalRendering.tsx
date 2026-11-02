// DAY 1 · TOPIC 5: Conditional rendering
//
// Show different UI depending on data, using plain JavaScript:
//  - Early return: return null to render nothing at all.
//  - Ternary: {condition ? <A /> : <B />} when you need one or the other.
//  - &&: {condition && <A />} when you need "A or nothing".
//
// Pitfall: {0 && <A />} renders the number 0, because 0 is a value React can
// print. Always make the left side a real boolean, like {n > 0 && <A />}.

import type { LeaveRequest } from "../../types";
import { sampleLeaves } from "../../sample/leaves";

function LeaveRow({ leave }: { leave: LeaveRequest }) {
  // Early return: Cancelled requests are not shown.
  if (leave.status === "Cancelled") return null;

  return (
    <div className="card row">
      <strong>{leave.employee}</strong>
      {/* Ternary: one of two things */}
      {leave.type === "Unpaid" ? <span className="muted">Unpaid</span> : <span>Paid</span>}
      <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
      {/* &&: a thing or nothing */}
      {leave.status === "Pending" && <button className="danger">Cancel</button>}
    </div>
  );
}

export default function ConditionalRendering() {
  const n = 0;

  return (
    <div>
      <h2>Conditional rendering</h2>
      <div className="demo">
        {sampleLeaves.map((leave) => (
          <LeaveRow key={leave.id} leave={leave} />
        ))}
      </div>

      <h3>The 0 pitfall</h3>
      <div className="cols-2">
        <div className="demo">
          <p className="muted">{"{0 && ...}"} (wrong)</p>
          <p>Items: [{n && <span>has items</span>}]</p>
        </div>
        <div className="demo">
          <p className="muted">{"{n > 0 && ...}"} (right)</p>
          <p>Items: [{n > 0 && <span>has items</span>}]</p>
        </div>
      </div>

      <p className="try">
        Try it: Meera Iyer's cancelled request is hidden. Change the early
        return so that Rejected requests are hidden too.
      </p>
    </div>
  );
}
