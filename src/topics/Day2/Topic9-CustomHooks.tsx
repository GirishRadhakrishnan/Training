// DAY 2 · TOPIC 9: Custom hooks
//
// A custom hook is a function whose name starts with "use" and that calls other
// hooks. It lets you reuse stateful logic. Each component that calls it gets its
// own separate state.
//
// This file defines two hooks:
// - useDebounce(value, delay): returns the value only after it has stopped
//   changing for `delay` ms. Useful to avoid filtering on every keystroke.
// - useLocalStorage(key, initial): like useState, but the value is also saved in
//   the browser's localStorage and restored on reload.
//
// In a real project hooks live in their own files (src/hooks/). They are kept
// here so the topic stays in one file.

import { useEffect, useState } from "react";
import { sampleLeaves } from "../../sample/leaves";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // a new keystroke cancels the previous timer
  }, [value, delay]);

  return debounced;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? initial : (JSON.parse(saved) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default function CustomHooks() {
  const [text, setText] = useLocalStorage("training-day2-search", "");
  const debounced = useDebounce(text, 400);

  const query = debounced.trim().toLowerCase();
  const results = sampleLeaves.filter((leave) => leave.employee.toLowerCase().includes(query));

  return (
    <div>
      <h2>Custom hooks</h2>
      <div className="demo">
        <label>
          Search employee{" "}
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Ravi" />
        </label>
        <p>Typed text: "{text}"</p>
        <p>Debounced text (after 400 ms): "{debounced}"</p>
        <p>{results.length} result(s)</p>
        {results.length === 0 && <p className="muted">No employee matches "{debounced}".</p>}
        <ul>
          {results.map((leave) => (
            <li key={leave.id}>
              {leave.employee}: {leave.type}, {leave.status}
            </li>
          ))}
        </ul>
      </div>
      <p className="try">
        Try it: type "ravi" quickly and watch the two texts. Reload the page: the text is still
        there. Where is it stored? (Browser dev tools, Application tab, Local storage.)
      </p>
    </div>
  );
}
