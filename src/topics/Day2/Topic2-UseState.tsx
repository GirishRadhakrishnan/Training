// DAY 2 · TOPIC 2: useState
//
// useState gives a component a value that survives renders, plus a setter.
// Calling the setter tells React to render again with the new value.
//
// Three things to remember:
// 1. State is a snapshot. Inside one event handler, `count` does not change
//    between lines, so setCount(count + 1) three times still adds only 1.
//    When the new value depends on the old one, pass an updater: setCount(c => c + 1).
// 2. Never change state objects or arrays in place. Make a copy: { ...form, reason }
//    for objects, filter / [...items, x] for arrays.
// 3. The React Compiler does not change these rules. Snapshots, updaters and
//    copying still work the same way.

import { useState } from "react";
import type { LeaveType } from "../../types";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <div className="row">
        <button
          onClick={() => {
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
          }}
        >
          +3 (wrong way)
        </button>
        <button
          onClick={() => {
            setCount((c) => c + 1);
            setCount((c) => c + 1);
            setCount((c) => c + 1);
          }}
        >
          +3 (updater form)
        </button>
        <button onClick={() => setCount((c) => c + 1)}>+1</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}

type Draft = { type: LeaveType; reason: string };

function ObjectState() {
  const [draft, setDraft] = useState<Draft>({ type: "Sick", reason: "Fever" });

  return (
    <div>
      <div className="row">
        <select
          aria-label="Leave type"
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value as LeaveType })}
        >
          <option>Annual</option>
          <option>Sick</option>
          <option>Casual</option>
          <option>Unpaid</option>
        </select>
        <input
          aria-label="Reason"
          value={draft.reason}
          onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
        />
      </div>
      <p>
        {draft.type}: {draft.reason}
      </p>
    </div>
  );
}

function ArrayState() {
  const [days, setDays] = useState<string[]>(["Day 1", "Day 2"]);
  const [next, setNext] = useState(3); // keeps labels unique, so they work as keys

  function addDay() {
    setDays([...days, `Day ${next}`]);
    setNext(next + 1);
  }

  return (
    <div>
      <button onClick={addDay}>Add day</button>
      <div className="row">
        {days.length === 0 && <p className="muted">No days added yet.</p>}
        {days.map((day) => (
          <button key={day} onClick={() => setDays(days.filter((d) => d !== day))}>
            {day} x
          </button>
        ))}
      </div>
    </div>
  );
}

export default function UseState() {
  return (
    <div>
      <h2>useState</h2>
      <h3>a) Snapshot problem</h3>
      <div className="demo">
        <Counter />
      </div>
      <h3>b) Object state: copy with spread</h3>
      <div className="demo">
        <ObjectState />
      </div>
      <h3>c) Array state: add and remove</h3>
      <div className="demo">
        <ArrayState />
      </div>
      <p className="try">
        Try it: click "+3 (wrong way)" and "+3 (updater form)" from 0 and compare. Then in (c),
        add three days, remove "Day 3" and add again. Why does the new label not reuse the number?
      </p>
    </div>
  );
}
