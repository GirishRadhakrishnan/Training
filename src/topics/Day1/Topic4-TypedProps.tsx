// DAY 1 · TOPIC 4: Typed props
//
// Props are the inputs of a component. In TypeScript, describe them with a type.
//  - leave: LeaveRequest is required. Forgetting it is a compile error.
//  - showEmployee?: boolean is optional. We give it a default of false.
//  - children is whatever you put between the opening and closing tags.
//
// Props are read-only. A component must never change its own props.
// If something needs to change, it is state (Day 2).

import type { ReactNode } from "react";
import type { LeaveRequest } from "../../types";
import { sampleLeaves } from "../../sample/leaves";

type LeaveCardProps = {
  leave: LeaveRequest;
  showEmployee?: boolean;
};

function LeaveCard({ leave, showEmployee = false }: LeaveCardProps) {
  return (
    <div className="card">
      {showEmployee && <h3>{leave.employee}</h3>}
      <p>
        {leave.type}: {leave.startDate} to {leave.endDate}
      </p>
      <p className="muted">{leave.reason}</p>
    </div>
  );
}
//child props
type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="demo">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function TypedProps() {
  return (
    <div>
      <h2>Typed props</h2>
      <div className="cols-2">
        <Panel title="Without employee name">
          <LeaveCard leave={sampleLeaves[0]} />
        </Panel>
        <Panel title="With employee name">
          <LeaveCard leave={sampleLeaves[3]} showEmployee />
        </Panel>
      </div>
    </div>
  );
}
