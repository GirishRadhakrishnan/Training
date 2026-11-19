// DAY 4 · TOPIC 0: What is routing? (slides)
//
// A short slide deck for the start of Day 4, shown before the code topics.
// Use the Previous and Next buttons, or the left and right arrow keys
// (click the slide once so it has focus).
//
// What the slides cover:
//   1. What is routing?
//   2. Why do we need routing?
//   3. React Router and its main features
//   4. How routing works in a React application (Leave Tracker example)
//   5. Authentication vs authorization
//   6. Error status codes: 401 and 403
//
// The deck itself uses useState to remember the current slide number.

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Topic0-RoutingIntro.module.css";

type Slide = {
  title: string;
  body: ReactNode;
};

const slides: Slide[] = [
  {
    title: "What is routing?",
    body: (
      <>
        <p className={styles.lead}>
          Routing is the mechanism that decides which screen should be displayed when a user
          navigates to a particular address or URL.
        </p>
        <h3>How routing works</h3>
        <ol className={styles.flow} aria-label="How routing works">
          <li className={styles.step}>
            <h3>User navigates to a URL</h3>
            <p>
              <code>/leaves</code>
            </p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>React Router checks the URL</h3>
            <p>Which route matches?</p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>Matching route</h3>
            <p>
              <code>/leaves</code> → <code>Leaves</code> component
            </p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>Screen shown</h3>
            <p>My leaves screen</p>
          </li>
        </ol>
      </>
    ),
  },
  {
    title: "Why do we need routing?",
    body: (
      <ul className={styles.points}>
        <li>Navigating between screens.</li>
        <li>Supporting browser back and forward buttons.</li>
        <li>Allowing users to open a particular screen directly using its URL.</li>
        <li>Maintaining the correct active navigation item.</li>
        <li>Handling invalid URLs when a page does not exist.</li>
      </ul>
    ),
  },
  {
    title: "React Router and its main features",
    body: (
      <>
        <p className={styles.lead}>
          React Router is the standard routing library for React. It maps URLs to components
          without reloading the page.
        </p>
        <ul className={styles.points}>
          <li>
            <strong>Routes and Route:</strong> map a URL path to a component.
          </li>
          <li>
            <strong>Link and NavLink:</strong> navigate without a page reload; NavLink marks the
            active page.
          </li>
          <li>
            <strong>useNavigate:</strong> move to another page from code, for example after saving a form.
          </li>
          <li>
            <strong>Nested routes and Outlet:</strong> share a layout (header, menu) across pages.
          </li>
          <li>
            <strong>URL params (<code>/leaves/:id</code>):</strong> read values from the path with useParams.
          </li>
          <li>
            <strong>Search params (<code>?status=Pending</code>):</strong> keep filters in the URL with
            useSearchParams.
          </li>
          <li>
            <strong>Wildcard route (<code>*</code>):</strong> show a not found page for unknown URLs.
          </li>
          <li>
            <strong>Protected routes:</strong> redirect users who are not logged in (UX only; the
            server enforces access).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How routing works in a React application",
    body: (
      <>
        <p className={styles.lead}>
          Example from our Leave Tracker: the user opens <code>/leaves/3</code> to see one leave request.
        </p>
        <ol className={styles.flow} aria-label="How routing works in the Leave Tracker">
          <li className={styles.step}>
            <h3>Browser URL</h3>
            <p>
              <code>/leaves/3</code>
            </p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>Router reads the URL</h3>
            <p>
              <code>BrowserRouter</code> watches the address bar
            </p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>Routes finds a match</h3>
            <p>
              <code>leaves/:id</code>, with id = "3"
            </p>
          </li>
          <li className={styles.arrow} aria-hidden="true">
            →
          </li>
          <li className={styles.step}>
            <h3>Layout and page</h3>
            <p>
              Header and menu stay; <code>LeaveDetail</code> fills the <code>Outlet</code>
            </p>
          </li>
        </ol>
        <h3>The route table of the Leave Tracker</h3>
        <ul className={styles.points}>
          <li>
            <code>/login</code> → Login
          </li>
          <li>
            <code>/leaves</code> → My leaves
          </li>
          <li>
            <code>/leaves/:id</code> → Leave detail
          </li>
          <li>
            <code>/team</code> → Team requests (managers only)
          </li>
          <li>
            <code>*</code> → Page not found
          </li>
        </ul>
        <p>
          Clicking a link changes the URL and React swaps the component. The page never reloads.
        </p>
      </>
    ),
  },
  {
    title: "Authentication vs authorization",
    body: (
      <>
        <div className="cols-2">
          <div className="card">
            <h3>Authentication: who are you?</h3>
            <ul className={styles.points}>
              <li>Proves your identity, for example by logging in.</li>
              <li>
                Happens first. Example: Asha logs in with her email and password.
              </li>
              <li>
                Failing it gives <strong>401</strong>: not signed in.
              </li>
            </ul>
          </div>
          <div className="card">
            <h3>Authorization: what may you do?</h3>
            <ul className={styles.points}>
              <li>Decides what a known user is allowed to see or do.</li>
              <li>
                Happens after login. Example: an Employee cannot open Team requests; a Manager can.
              </li>
              <li>
                Failing it gives <strong>403</strong>: signed in, but not allowed.
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.lead}>
          In React, hiding a button or redirecting is only for a better experience. The server must
          enforce the rules, because anyone can call the API without our React code.
        </p>
      </>
    ),
  },
  {
    title: "Error status codes: 401 and 403",
    body: (
      <>
        <div className="cols-2">
          <div className="card">
            <h3>401 Unauthorized</h3>
            <ul className={styles.points}>
              <li>
                Meaning: <strong>not signed in</strong>, or the token is missing, wrong or expired.
              </li>
              <li>Example: opening My leaves with no token.</li>
              <li>
                React should: send the user to the <strong>login page</strong>, then bring them back.
              </li>
            </ul>
          </div>
          <div className="card">
            <h3>403 Forbidden</h3>
            <ul className={styles.points}>
              <li>
                Meaning: <strong>signed in, but not allowed</strong> for this action.
              </li>
              <li>Example: an Employee opening Team requests.</li>
              <li>
                React should: show a clear <strong>"Not allowed" page</strong>. Do not sign the user out.
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.lead}>
          Remember: <strong>401 = who are you?</strong> and <strong>403 = I know you, but no.</strong>{" "}
          Logging in again does not fix a 403.
        </p>
      </>
    ),
  },
];

export default function RoutingIntro() {
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
    <div className={styles.deck} tabIndex={0} onKeyDown={onKeyDown} aria-label="Routing slides">
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
