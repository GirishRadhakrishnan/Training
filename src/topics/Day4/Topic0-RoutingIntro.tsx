// DAY 4 · TOPIC 0: What is routing? (slides)
//
// A short slide deck for the start of Day 4, shown before the code topics.
// Use the Previous and Next buttons, or the left and right arrow keys
// (click the slide once so it has focus).
//
// What the slides cover:
//   1. What is routing?
//   2. Why do we need routing?
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
