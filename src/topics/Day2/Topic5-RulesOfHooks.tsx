// DAY 2 · TOPIC 5: Rules of hooks
//
// React remembers state by the ORDER in which hooks are called. So:
// 1. Call hooks only at the top level of a component or a custom hook.
// 2. Never call a hook inside an if, a loop, a nested function or after an early return.
// 3. Call hooks only from function components or other hooks.
//
// Rule of thumb: all hooks first, early returns after.
//
// If a render calls a different number of hooks than the previous render, React
// throws an error at runtime: "Rendered more hooks than during the previous render."
// (An ESLint rule for this is added later in the course.)
//
// BROKEN example 1: early return before a hook
//
//   function Counter({ show }: { show: boolean }) {
//     if (!show) return null;              // returns before the hook below
//     const [count, setCount] = useState(0); // skipped when show is false
//     ...
//   }
//
// BROKEN example 2: hook inside an if
//
//   function Counter({ big }: { big: boolean }) {
//     if (big) {
//       const [count, setCount] = useState(0); // only called sometimes
//     }
//     ...
//   }
//
// The working version below calls useState first and returns early afterwards.

import { useState } from "react";

function Counter({ show }: { show: boolean }) {
  const [count, setCount] = useState(0); // hooks first
  if (!show) return null; // early return after

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add 1</button>
    </div>
  );
}

export default function RulesOfHooks() {
  const [show, setShow] = useState(true);

  return (
    <div>
      <h2>Rules of hooks</h2>
      <div className="demo">
        <label>
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show
          the counter
        </label>
        <Counter show={show} />
      </div>
      <p className="note">
        The Counter keeps its count while hidden, because its component is still rendered. It
        only returns nothing.
      </p>
      <p className="try">
        Try it: add 3, hide the counter, show it again. The count is still 3. Then, in a copy
        of this file, move the early return above useState, then toggle the checkbox and read the error in the browser.
      </p>
    </div>
  );
}
