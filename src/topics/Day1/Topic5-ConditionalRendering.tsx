// DAY 1 · TOPIC 5: Conditional rendering
//
// Show different UI depending on data, using plain JavaScript:
//  - Early return: return null to render nothing at all.
//  - Ternary: {condition ? <A /> : <B />} when you need one or the other.
//  - &&: {condition && <A />} when you need "A or nothing".
//

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
    </div>
  );
}
