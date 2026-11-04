// DAY 1 · TOPIC 0: Introduction (slides)
//
// A short slide deck for the start of Day 1, shown before the code topics.
// Use the Previous and Next buttons, or the left and right arrow keys
// (click the slide once so it has focus).
//
// What the slides cover:
//   1. What React is and who made it
//   2. Why it was created
//   3. Library or framework?
//   4. Setting up a project with Vite
//   5. What each part of the Vite command means
//   6. Oxlint and ESLint
//   7. How a page is rendered in React
//   8. The DOM and the virtual DOM
//
// The deck keeps the current slide number in state. State is taught properly
// on Day 2; for now, just notice that clicking Next changes what is on screen.

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Topic0-Introduction.module.css";

type Slide = {
  title: string;
  body: ReactNode;
};

const commandParts = [
  { part: "npm create", meaning: "Runs a project initializer" },
  { part: "vite@latest", meaning: "Uses the latest create-vite initializer" },
  { part: "my-app", meaning: "Project folder name" },
  { part: "--", meaning: "Passes the remaining arguments to the initializer" },
  { part: "--template react-ts", meaning: "Selects the React + TypeScript template" },
];

const renderSteps = [
  { step: "Browser loads index.html", detail: "The page is almost empty." },
  { step: '<div id="root"></div>', detail: "An empty container where React will draw the UI." },
  { step: "Vite loads main.tsx", detail: "The entry file of the app." },
  { step: 'createRoot(document.getElementById("root"))', detail: "Tells React which element it controls." },
  { step: ".render(<App />)", detail: "Starts rendering from the top component." },
  { step: "React executes the App component", detail: "App is just a function. React calls it." },
  { step: "App returns JSX", detail: "A description of what the screen should look like." },
  { step: "React creates and updates the DOM", detail: "Only the parts that changed are touched." },
  { step: "Browser displays the UI", detail: "The user sees the page." },
];

type TreeProps = { cx: number; top: number; pText: string; changed?: boolean };

// A tiny tree: div with two children (h1 and p). x positions are relative to cx.
function Tree({ cx, top, pText, changed }: TreeProps) {
  const pClass = changed ? `${styles.node} ${styles.changed}` : styles.node;
  return (
    <g>
      <line className={styles.edge} x1={cx} y1={top + 28} x2={cx - 55} y2={top + 60} />
      <line className={styles.edge} x1={cx} y1={top + 28} x2={cx + 55} y2={top + 60} />
      <rect className={styles.node} x={cx - 30} y={top} width={60} height={28} rx={6} />
      <text className={styles.nodeText} x={cx} y={top + 19}>div</text>
      <rect className={styles.node} x={cx - 85} y={top + 60} width={60} height={28} rx={6} />
      <text className={styles.nodeText} x={cx - 55} y={top + 79}>h1</text>
      <rect className={pClass} x={cx + 25} y={top + 60} width={60} height={28} rx={6} />
      <text className={styles.nodeText} x={cx + 55} y={top + 79}>p</text>
      <text className={styles.caption} x={cx + 55} y={top + 108}>{pText}</text>
    </g>
  );
}

function DomDiagram() {
  return (
    <svg
      className={styles.diagram}
      viewBox="0 0 760 330"
      role="img"
      aria-label="State changes produce a new virtual DOM. React compares it with the old virtual DOM and updates only the changed paragraph in the real DOM."
    >
      <defs>
        <marker id="dom-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
        </marker>
      </defs>

      <text className={styles.heading} x={120} y={20}>Old virtual DOM</text>
      <Tree cx={120} top={35} pText={'"Count: 0"'} />

      <text className={styles.heading} x={120} y={190}>New virtual DOM (after state change)</text>
      <Tree cx={120} top={205} pText={'"Count: 1"'} changed />

      <line className={styles.arrow} x1={225} y1={95} x2={310} y2={160} markerEnd="url(#dom-arrow)" />
      <line className={styles.arrow} x1={225} y1={255} x2={310} y2={190} markerEnd="url(#dom-arrow)" />

      <circle className={styles.diff} cx={345} cy={175} r={36} />
      <text className={styles.nodeText} x={345} y={172}>Diff</text>
      <text className={styles.caption} x={345} y={188}>compare</text>

      <line className={styles.arrow} x1={382} y1={175} x2={470} y2={175} markerEnd="url(#dom-arrow)" />
      <text className={styles.caption} x={426} y={165}>patch</text>

      <text className={styles.heading} x={600} y={90}>Real DOM (in the browser)</text>
      <Tree cx={600} top={105} pText={'text updated: "Count: 1"'} changed />
      <text className={styles.caption} x={600} y={260}>Only the changed p is touched.</text>
      <text className={styles.caption} x={600} y={278}>The div and h1 are left alone.</text>
    </svg>
  );
}

const slides: Slide[] = [
  {
    title: "What is React?",
    body: (
      <>
        <p className={styles.lead}>
          React is a JavaScript library for building user interfaces from small,
          reusable pieces called components.
        </p>
        <p className={styles.lead}>
          It was created at Meta (then Facebook) by Jordan Walke, and released as
          open source in 2013.
        </p>
      </>
    ),
  },
  {
    title: "Why was React created?",
    body: (
      <ul className={styles.points}>
        <li>Facebook's pages had lots of data that kept changing: messages, counts, comments.</li>
        <li>Updating the screen by hand after every change led to bugs and tangled code.</li>
        <li>Idea: describe what the screen should look like for the current data.</li>
        <li>React works out what changed and updates only that part of the page.</li>
        <li>Components let teams build once and reuse everywhere.</li>
      </ul>
    ),
  },
  {
    title: "Library or framework?",
    body: (
      <>
        <div className={styles.compare}>
          <div className={styles.panel}>
            <h3>Library</h3>
            <p>You call it, when and where you need it.</p>
            <p>Does one job. You choose the other tools.</p>
            <p className="muted">Example: React</p>
          </div>
          <div className={styles.panel}>
            <h3>Framework</h3>
            <p>It calls your code, inside a structure it defines.</p>
            <p>Decides folders, routing and data rules for you.</p>
            <p className="muted">Examples: Angular, Next.js</p>
          </div>
        </div>
        <p className="note">
          React only draws the UI. In this training we add the rest ourselves:
          React Router for pages and TanStack Query for server data.
        </p>
      </>
    ),
  },
  {
    title: "Setting up a project",
    body: (
      <>
        <h3>Prerequisites</h3>
        <ul className={styles.points}>
          <li>Node.js 22.22 or newer (this also installs npm)</li>
          <li>A code editor, such as VS Code</li>
          <li>A modern browser</li>
        </ul>
        <p className="note">
          Create React App (<code>npx create-react-app</code>) was officially
          deprecated in 2025. Do not use it for new projects. Use Vite.
        </p>
        <pre>{`npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev`}</pre>
      </>
    ),
  },
  {
    title: "The command, part by part",
    body: (
      <>
        <pre>npm create vite@latest my-app -- --template react-ts</pre>
        <table>
          <thead>
            <tr>
              <th scope="col">Part</th>
              <th scope="col">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {commandParts.map((row) => (
              <tr key={row.part}>
                <td>
                  <code>{row.part}</code>
                </td>
                <td>{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: "Oxlint and ESLint",
    body: (
      <>
        <p>Both are linters: they read your code and flag likely mistakes.</p>
        <table>
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">ESLint</th>
              <th scope="col">Oxlint</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Written in</th>
              <td>JavaScript</td>
              <td>Rust</td>
            </tr>
            <tr>
              <th scope="row">Speed</th>
              <td>Slower on large projects</td>
              <td>Much faster (often 50 to 100 times)</td>
            </tr>
            <tr>
              <th scope="row">Rules</th>
              <td>Huge plugin ecosystem, custom rules</td>
              <td>Common rules built in, fewer extras</td>
            </tr>
            <tr>
              <th scope="row">Setup</th>
              <td>Needs a config file</td>
              <td>Works with little or no config</td>
            </tr>
            <tr>
              <th scope="row">Preferred for client and enterprise projects</th>
              <td>Yes, the standard choice: mature, proven and widely supported</td>
              <td>As a fast add-on, not a replacement (newer, fewer rules)</td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          For client and enterprise work, start with ESLint: custom rules,
          shared team configs and wide tool support matter there. Teams on very
          large codebases often add Oxlint for fast feedback and keep ESLint for
          the rest. We add ESLint on Day 2.
        </p>
      </>
    ),
  },
  {
    title: "How a page is rendered in React",
    body: (
      <ol className={styles.flow}>
        {renderSteps.map((row) => (
          <li key={row.step}>
            <code>{row.step}</code>
            <span className="muted"> {row.detail}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: "The DOM and the virtual DOM",
    body: (
      <>
        <div className={styles.compare}>
          <div className={styles.panel}>
            <h3>DOM (real)</h3>
            <p>The browser's tree of page elements. Changing it is slow work.</p>
          </div>
          <div className={styles.panel}>
            <h3>Virtual DOM</h3>
            <p>React's lightweight copy: plain JavaScript objects. Cheap to create.</p>
          </div>
        </div>
        <DomDiagram />
        <ol className={styles.points}>
          <li>State changes, so React renders the component again.</li>
          <li>React builds a new virtual DOM and compares it with the old one (diffing).</li>
          <li>Only the difference is applied to the real DOM: here, one text node.</li>
        </ol>
      </>
    ),
  },
];

export default function Introduction() {
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
    <div>
      <div className={styles.deck} tabIndex={0} onKeyDown={onKeyDown} aria-label="Introduction slides">
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
      
    </div>
  );
}
