// DAY 1 · TOPIC 7: Lists, map, filter and keys
//
// To show a list, turn an array of data into an array of JSX with map().
// To show only some items, filter() first, then map().
// Every item needs a key prop: a stable, unique id (leave.id).
// React uses the key to know which item is which when the list changes.
//
// Do not use the array index as a key if items can be added, removed or
// reordered: React will attach the wrong state (like typed text) to the wrong row.

import type { LeaveRequest } from "../../types";
import { sampleLeaves } from "../../sample/leaves";

function LeaveItem({ leave }: { leave: LeaveRequest }) {
  return (
    <li>
      {leave.employee}: {leave.type}, {leave.startDate}{" "}
      <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
    </li>
  );
}

function LeaveSection({ title, leaves }: { title: string; leaves: LeaveRequest[] }) {
  return (
    <section className="demo">
      <h3>{title}</h3>
      {leaves.length === 0 ? (
        <p className="muted">No {title.toLowerCase()} requests.</p>
      ) : (
        <ul>
          {leaves.map((leave) => (
            
            <LeaveItem key={leave.id} leave={leave} />
          ))}
        </ul>
      )}
    </section>
  );
}

// The same array can feed a different UI: here each item becomes a table row.
function LeaveGrid({ leaves }: { leaves: LeaveRequest[] }) {
  return (
    <section className="demo">
      <h3>Requests Status</h3>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              <td>{leave.employee}</td>
              <td>{leave.type}</td>
              <td>{leave.startDate}</td>
              <td>{leave.endDate}</td>
              <td>
                <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function ListsMapFilterKeys() {
  const pending = sampleLeaves.filter((leave) => leave.status === "Pending");
  const decided = sampleLeaves.filter((leave) => leave.status !== "Pending");
  const none: LeaveRequest[] = [];

  return (
    <div>
      <h2>Lists, map, filter and keys</h2>
      <LeaveSection title="Pending" leaves={pending} />
      <LeaveSection title="Decided" leaves={decided} />
      <LeaveSection title="Withdrawn" leaves={none} />
      <LeaveGrid leaves={sampleLeaves} />
    </div>
  );
}
