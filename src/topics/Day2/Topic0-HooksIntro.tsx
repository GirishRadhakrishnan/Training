// DAY 2 · TOPIC 0: Why state and hooks (slides)
//
// A short slide deck for the start of Day 2, shown before the code topics.
// Use the Previous and Next buttons, or the left and right arrow keys
// (click the slide once so it has focus).
//
// What the slides cover:
//   1. Why state exists
//   2. What a hook is, and why we need it
//   3. How React solved it before hooks
//   4. The solution: hooks (React 16.8)
//   5. Advantages of hooks
//   6. Built-in hooks and the two rules
//   7. Common hooks at a glance
//   8. useState or useReducer?
//
// The deck itself uses useState to remember the current slide number.

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Topic0-HooksIntro.module.css";

type Slide = {
  title: string;
  body: ReactNode;
};

const commonHooks = [
  {
    hook: "useState",
    does: "Gives a component memory. Changing it re-renders.",
    where: "Form inputs, open/closed toggles, selected tab, filter text.",
    examples: "Shop: cart quantity, size picker. Leave app: leave form fields, status filter.",
  },
  {
    hook: "useEffect",
    does: "Runs side effects after render.",
    where: "Syncing with the outside: event listeners, timers, document title.",
    examples: "Shop: set page title to the product name. Leave app: refresh data when the window regains focus.",
  },
  {
    hook: "useRef",
    does: "Holds a value that persists but does not cause a re-render. Can also point to a DOM element.",
    where: "Focusing an input, measuring an element, storing a timer id.",
    examples: "Shop: focus the search box on load. Leave app: focus the first invalid field after a failed submit.",
  },
  {
    hook: "useContext",
    does: "Reads shared data without passing props through every level.",
    where: "Theme, current language, signed-in user.",
    examples: "Shop: signed-in customer, currency. Leave app: current employee and role.",
  },
  {
    hook: "useMemo",
    does: "Caches the result of a calculation.",
    where: "Rare: a proven slow calculation, such as filtering a very large list.",
    examples: "Shop: filtering and sorting thousands of products. Leave app: not needed, calculate during render.",
  },
  {
    hook: "useCallback",
    does: "Caches a function between renders.",
    where: "Rare: a function passed to a memoized child component.",
    examples: "Shop: stable handler for a memoized product card. Leave app: not needed.",
  },
  {
    hook: "useReducer",
    does: "Like useState, for complex state logic.",
    where: "Multi-step forms, shopping carts, state with many related actions.",
    examples: "Shop: cart with add, remove, clear. Leave app: leave request wizard with next, back, submit.",
  },
  {
    hook: "Custom hooks",
    does: "Your own useXyz that bundles other hooks.",
    where: "Reusable logic such as useLocalStorage, useDebounce, useWindowSize.",
    examples: "Shop: useDebounce for search-as-you-type. Leave app: a hook that calculates leave balance, shared by several screens.",
  },
];

const stateHooks = [
  { hook: "useState", when: "Simple values: a number, string, boolean, small object or array" },
  {
    hook: "useReducer",
    when: "Complex state, where the next value depends on an action, or many fields change together",
  },
];

const slides: Slide[] = [
  {
    title: "Why state exists",
    body: (
      <>
        <p className={styles.lead}>
          A component is a function. Every time React calls it, all local
          variables start again from scratch.
        </p>
        <ul className={styles.points}>
          <li>
            A plain variable such as <code>let count = 0</code> is reset on every render.
          </li>
          <li>Changing a plain variable does not tell React to redraw the screen.</li>
          <li>The screen needs data that is remembered between renders: a counter, a form field, an open menu.</li>
          <li>
            <strong>State</strong> is that memory. When it changes, React renders the component again.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "What is a hook and why?",
    body: (
      <>
        <p className={styles.lead}>
          A hook is a function whose name starts with <code>use</code>. It lets a
          function component "hook into" React features.
        </p>
        <ul className={styles.points}>
          <li>Function components are plain functions, with no memory and no way to react to events in their life.</li>
          <li>Hooks give them state, side effects, refs, shared data and more.</li>
          <li>
            React keeps the hook values for each component instance and hands the
            same values back on the next render.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How React solved it before hooks",
    body: (
      <>
        <p>Only class components could have state. Function components were for simple display.</p>
        <div className={styles.compare}>
          <div className={styles.panel}>
            <h3>Class component</h3>
            <pre>{`class Counter extends Component {
  state = { count: 0 };
  render() {
    return (
      <button onClick={() =>
        this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}`}</pre>
          </div>
          <div className={styles.panel}>
            <h3>The pain points</h3>
            <ul className={styles.points}>
              <li>
                <code>this</code> is confusing and easy to get wrong.
              </li>
              <li>
                Lifecycle methods (<code>componentDidMount</code>, <code>componentDidUpdate</code>)
                split related code apart.
              </li>
              <li>Sharing logic needed higher-order components or render props, which nest deeply.</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "The solution: hooks",
    body: (
      <>
        <p className={styles.lead}>React 16.8 (February 2019) introduced hooks.</p>
        <pre>{`function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`}</pre>
        <ul className={styles.points}>
          <li>Same behavior as the class, in a fraction of the code.</li>
          <li>No <code>this</code>, no lifecycle methods, no class.</li>
          <li>Today, hooks are the standard way to write React.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Advantages of hooks",
    body: (
      <ul className={styles.points}>
        <li>Less code, easier to read: components are just functions.</li>
        <li>Related logic stays together instead of being split across lifecycle methods.</li>
        <li>Logic is reusable: bundle hooks into your own custom hook and share it.</li>
        <li>No <code>this</code> binding and no wrapper components.</li>
        <li>Easier to test and to understand in small pieces.</li>
        <li>Works well with TypeScript and with newer React features.</li>
      </ul>
    ),
  },
  {
    title: "Built-in hooks and the two rules",
    body: (
      <>
        <p>
          React ships with built-in hooks, such as <code>useState</code>,{" "}
          <code>useEffect</code>, <code>useRef</code>, <code>useContext</code> and{" "}
          <code>useReducer</code>. You can also write your own.
        </p>
        <div className={styles.compare}>
          <div className={styles.panel}>
            <h3>Rule 1</h3>
            <p>Call hooks only at the top level of a component.</p>
            <p className="muted">Not inside if, loops or nested functions.</p>
          </div>
          <div className={styles.panel}>
            <h3>Rule 2</h3>
            <p>Call hooks only from function components or other hooks.</p>
            <p className="muted">Not from regular functions or class components.</p>
          </div>
        </div>
        <p className="note">
          React remembers hooks by the order they are called, so the order must be the same on every render.
        </p>
      </>
    ),
  },
  {
    title: "Common hooks at a glance",
    body: (
      <table>
        <thead>
          <tr>
            <th scope="col">Hook</th>
            <th scope="col">What it does</th>
            <th scope="col">Commonly used for</th>
          </tr>
        </thead>
        <tbody>
          {commonHooks.map((row) => (
            <tr key={row.hook}>
              <td>
                <code>{row.hook}</code>
              </td>
              <td>{row.does}</td>
              <td>
                {row.where}
                <br />
                <small className="muted">{row.examples}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    title: "useState or useReducer?",
    body: (
      <>
        <p>For state we commonly use:</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Hook</th>
              <th scope="col">Use it when</th>
            </tr>
          </thead>
          <tbody>
            {stateHooks.map((row) => (
              <tr key={row.hook}>
                <td>
                  <code>{row.hook}</code>
                </td>
                <td>{row.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
];

export default function HooksIntro() {
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;
  const slide = slides[index];

  function go(next: number) {
    setIndex(Math.min(last, Math.max(0, next)));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") go(index + 1);
    if (event.key === "ArrowLeft") go(index - 1);
  }

  return (
    <div className={styles.deck} tabIndex={0} onKeyDown={onKeyDown} aria-label="State and hooks slides">
      <p className={styles.counter}>
        Slide {index + 1} of {slides.length}
      </p>
      <section className={styles.slide} aria-live="polite">
        <h2>{slide.title}</h2>
        {slide.body}
      </section>
      <div className={styles.controls}>
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          Previous
        </button>
        <button type="button" className="primary" onClick={() => go(index + 1)} disabled={index === last}>
          Next
        </button>
      </div>
    </div>
  );
}
