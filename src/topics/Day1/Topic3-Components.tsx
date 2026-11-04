// DAY 1 · TOPIC 3: Components
//
// A component is a function that returns JSX. Rules:
//  - The name starts with a capital letter (LeaveCard, not leaveCard).
//  - You use it like a tag: <LeaveCard />.
//  - Components can contain other components. This is called composition.
//
// Below, LeaveCard has no props, so every card shows the same text.
// That is the problem: a reusable component needs input. Props (Topic 4)
// are how a parent passes data to a child.

import { sampleLeaves } from "../../sample/leaves";

function LeaveCard() {
  const leave = sampleLeaves[0];
  return (
    <div className="card">
      <h3>{leave.employee}</h3>
      <p>
        {leave.type}: {leave.startDate} to {leave.endDate}
      </p>
    </div>
  );
}

function LeaveList() {
  return (
    <div>
      <LeaveCard />
      <LeaveCard />
      <LeaveCard />
    </div>
  );
}

export default function Components() {
  return (
    <div>
      <h2>Components</h2>
      <div className="demo">
        <LeaveList />
      </div>
      <p className="note">
        The three 3 cards are identical because LeaveCard cannot receive data. We
        need props so each card can show a different leave request.
      </p>
      <p className="try">
        Try it: rename LeaveCard to leaveCard and look at the error. Why does
        React need the capital letter?
      </p>
    </div>
  );
}
