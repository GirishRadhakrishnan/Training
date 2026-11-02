// DAY 2 · TOPIC 1: Props vs state
//
// Props are the inputs a component receives from its parent. They are read-only:
// the component must never change them.
// State is memory that belongs to one component. When it changes, React renders
// that component again.
//
// Rule of thumb: if the parent decides the value, it is a prop. If the component
// itself changes the value over time, it is state.
//
// Below, two BalanceCard components get different props. Each one has its own
// state, so clicking a button in one card does not change the other card.

import { useState } from "react";

type BalanceCardProps = {
  title: string;
  allowed: number; // prop: set by the parent, read-only
};

function BalanceCard({ title, allowed }: BalanceCardProps) {
  const [requested, setRequested] = useState(0); // state: owned by this card
  const remaining = allowed - requested;

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Allowed (prop): {allowed}</p>
      <p>Requested (state): {requested}</p>
      <p>Remaining: {remaining}</p>
      <button onClick={() => setRequested(requested + 1)} disabled={remaining === 0}>
        Request 1 day
      </button>
    </div>
  );
}

export default function PropsVsState() {
  return (
    <div>
      <h2>Props vs state</h2>
      <div className="demo cols-2">
        <BalanceCard title="Annual leave" allowed={18} />
        <BalanceCard title="Casual leave" allowed={6} />
      </div>
      <p className="try">
        Try it: click "Request 1 day" on the Casual card until it is disabled. Then check that
        the Annual card did not change. Which value is a prop and which is state?
      </p>
    </div>
  );
}
