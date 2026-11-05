// DAY 1 · TOPIC 2: JSX
//
// JSX looks like HTML but it is JavaScript. Vite turns it into function calls.
// Rules to remember:
//  1. Use {} to put any JavaScript expression into the markup.
//  2. Attributes are camelCase: className, htmlFor, onClick, tabIndex.
//  3. style takes an object, not a string: style={{ color: "red" }}.
//  4. Every tag must be closed, including <input /> and <br />.
//  5. A component returns ONE root. Use a fragment <>...</> when you do not
//     want an extra wrapper element in the page.

import { sampleLeaves } from "../../sample/leaves";

export default function Jsx() {
  const leave = sampleLeaves[0];
  const days = 5;

  return (
    <>
      <h2>JSX</h2>

      <div className="demo">
        {/* 1. Expressions in braces */}
        <p>
          {leave.employee} requested {leave.type.toLowerCase()} leave for {days} days
          ({days * 8} hours).
        </p>

        {/* 2. camelCase attributes */}
        <label htmlFor="jsx-name">Employee</label>{" "}
        <input id="jsx-name" className="jsx-input" defaultValue={leave.employee} />

        {/* 3. style is an object (outer braces = expression, inner = object) */}
        <p style={{ color: "#8c1d18", fontWeight: 600 }}>Styled with an object</p>

        {/* 4. Closed tags */}
        <br />
        <input type="checkbox" id="jsx-check" /> <label htmlFor="jsx-check">Self-closing input</label>
      </div>

      <p className="note">
        This components returns a fragment, so the h2 and the div sit side by side
        with no extra wrapper element.
      </p>

      <p className="try">
        Try it: change <code>className</code> on the input to <code>class</code>{" "}
        and read the error React shows. Then change it back.
      </p>
    </>
  );
}
