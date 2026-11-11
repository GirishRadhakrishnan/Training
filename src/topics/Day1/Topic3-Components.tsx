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

import { Component } from "react";
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

// The older way: a class component. It extends Component and must have a
// render() method that returns JSX. It does the same job as LeaveCard.
// Know how to read it, but write function components in new code.
class LeaveCardClass extends Component {
  render() {
    const leave = sampleLeaves[0];
    return (
      <div className="card">
        <h3>{leave.employee} (class)</h3>
        <p>
          {leave.type}: {leave.startDate} to {leave.endDate}
        </p>
      </div>
    );
  }
}

function LeaveList() {
  return (
    <div>
      <LeaveCard />
      <LeaveCard />
      <LeaveCard />
      <LeaveCardClass />
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
    </div>
  );
}
