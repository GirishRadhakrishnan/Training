// DAY 1 · TOPIC 1: React fundamentals
//
// React builds the screen from data: UI = f(data).
// You write a function (a component) that takes data and returns what the
// screen should look like. When the data changes, React runs the function again.
//
// A page is a tree of components. Each component is a small, reusable piece.
// The same component can show different data: here PendingCount is used 3 times.
//
// Component tree on this page:
//
//   ReactFundamentals
//   └── div.demo
//       ├── PendingCount (Asha Rao)
//       ├── PendingCount (Ravi Menon)
//       └── PendingCount (Meera Iyer)

import { sampleLeaves } from "../../sample/leaves";

function PendingCount({ employee }: { employee: string }) {
  const count = sampleLeaves.filter(
    (leave) => leave.employee === employee && leave.status === "Pending",
  ).length;

  return (
    <p>
      {employee} has {count} pending request(s).
    </p>
  );
}

export default function ReactFundamentals() {
  return (
    <div>
      <h2>React fundamentals</h2>
      <p>Same component, different data, different output:</p>
      <div className="demo">
        <PendingCount employee="Asha Rao" />
        <PendingCount employee="Ravi Menon" />
        <PendingCount employee="Meera Iyer" />
      </div>
      
    </div>
  );
}
