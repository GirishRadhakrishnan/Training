// DAY 2 · TOPIC 6: useEffect
//
// An effect is code that runs AFTER React has put the component on the screen.
// Use it to synchronise with something outside React: the page title, a timer,
// a browser event.
//
// useEffect(setup, [dependencies]): setup runs after the first render and again
// whenever a dependency changes. The function you return is the cleanup. It runs
// before the next setup and when the component is removed.
//
// You might not need an effect. If a value can be calculated from props or state,
// calculate it during render (see part c). Do not copy it into more state.
//
// In development, StrictMode runs every effect twice (setup, cleanup, setup) to
// reveal missing cleanups. That does not happen in production.
// Fetching data with effects comes on Day 3, where TanStack Query does it better.

import { useEffect, useState } from "react";

function TitleDemo() {
  const [days, setDays] = useState(1);

  useEffect(() => {
    const previous = document.title;
    document.title = `${days} day(s) requested`;
    return () => {
      document.title = previous;
    };
  }, [days]);

  return (
    <div className="row">
      <button onClick={() => setDays(days + 1)}>Request one more day</button>
      <span>Browser tab title: {days} day(s) requested</span>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    console.log("Clock: timer started");
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(id);
      console.log("Clock: timer stopped (cleanup)");
    };
  }, []);

  return <p>Time: {now.toLocaleTimeString("en-IN")}</p>;
}

function ClockDemo() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label>
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show
        clock
      </label>
      {show && <Clock />}
    </div>
  );
}

function LabelDemo() {
  const [days, setDays] = useState(2);

  // Calculated during render: no effect, no extra state
  const label = days > 5 ? "Long leave" : "Short leave";

  return (
    <div className="row">
      <input
        type="number"
        min={1}
        aria-label="Days"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
      />
      <span>{label}</span>
    </div>
  );
}

export default function UseEffect() {
  return (
    <div>
      <h2>useEffect</h2>
      <h3>a) Sync the document title</h3>
      <div className="demo">
        <TitleDemo />
      </div>
      <h3>b) Timer with cleanup</h3>
      <div className="demo">
        <ClockDemo />
      </div>
      <h3>c) You might not need an effect</h3>
      <div className="demo">
        <LabelDemo />
      </div>
      <p className="note">
        d) StrictMode runs effects twice in development, so you will see the Clock log lines
        twice. Data fetching with effects is not taught here. It comes on Day 3.
      </p>
      <p className="try">
        Try it: open the browser console, tick "Show clock" and untick it. Which line is
        printed on unmount? Then comment out clearInterval and see what keeps happening.
      </p>
    </div>
  );
}
