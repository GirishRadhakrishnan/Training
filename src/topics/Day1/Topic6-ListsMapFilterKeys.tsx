// DAY 1 · TOPIC 6: Lists, map, filter and keys
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

export default function ListsMapFilterKeys() {
  const pending = sampleLeaves.filter((leave) => leave.status === "Pending");
  const decided = sampleLeaves.filter((leave) => leave.status !== "Pending");
  const sampleReject = sampleLeaves.filter((leave) => leave.status === "Rejected");
  const none: LeaveRequest[] = [];

  return (
    <div>
      <h2>Lists, map, filter and keys</h2>
      <LeaveSection title="Pending" leaves={pending} />
      <LeaveSection title="Decided" leaves={decided} />
      <LeaveSection title="Rejected" leaves={sampleReject} />
      <LeaveSection title="Withdrawn" leaves={none} />

      <p className="note">
        Demo the key bugs: (1) remove <code>key=</code> from LeaveItem and open
        the browser console to see the "unique key" warning. (2) Use{" "}
        <code>key=&#123;index&#125;</code> in a list with inputs, type in a row,
        then reorder or remove an item on Day 2 when state exists: the typed text
        stays at the same position instead of following its item.
      </p>

      <p className="try">
        Try it: add a third filter section for Rejected requests. What happens
        when the list is empty?
      </p>
    </div>
  );
}
