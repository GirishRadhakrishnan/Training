// DAY 2 · TOPIC 7: useRef
//
// useRef gives you a box: ref.current. Changing it does NOT cause a render.
// Two common uses:
// 1. Hold a DOM element (pass the ref to an element's `ref` prop) to focus it.
// 2. Hold a value that must survive renders but is not shown on screen, such as
//    a timer id.
//
// In React 19, `ref` is a normal prop on function components. You no longer need
// forwardRef: LabeledInput below simply receives `ref` and passes it to the input.
//
// Do not read or write ref.current during render. Use it in effects and handlers.

import { useEffect, useRef, useState } from "react";
import type { Ref } from "react";

type LabeledInputProps = {
  label: string;
  ref?: Ref<HTMLInputElement>; // ref is a normal prop in React 19
};

function LabeledInput({ label, ref }: LabeledInputProps) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}

function AutoFocus() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="row">
      <LabeledInput label="Reason" ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus the field</button>
    </div>
  );
}

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalId = useRef<number | null>(null); // not shown on screen, so a ref

  function stop() {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }

  function start() {
    if (intervalId.current !== null) return; // already running
    intervalId.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function reset() {
    stop();
    setSeconds(0);
  }

  // Stop the timer if the component is removed while running
  useEffect(() => stop, []);

  return (
    <div className="row">
      <span>Seconds: {seconds}</span>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default function UseRef() {
  const [showWatch, setShowWatch] = useState(true);

  return (
    <div>
      <h2>useRef</h2>
      <h3>Autofocus and a ref as a prop</h3>
      <div className="demo">
        <AutoFocus />
      </div>
      <h3>Keep a timer id in a ref</h3>
      <div className="demo">
        <label>
          <input
            type="checkbox"
            checked={showWatch}
            onChange={(e) => setShowWatch(e.target.checked)}
          />{" "}
          Show stopwatch
        </label>
        {showWatch && <Stopwatch />}
      </div>
      <p className="try">
        Try it: press Start, then Start again. Why does it not run twice as fast? Then change
        intervalId to useState and think about what extra renders that would cause.
      </p>
    </div>
  );
}
