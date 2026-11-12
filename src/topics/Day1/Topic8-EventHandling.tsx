// DAY 1 · TOPIC 8: Event handling
//
// Pass a function to an event prop: onClick, onChange, onSubmit.
//  - Pass the function itself: onClick={handleClick}
//  - Need an argument? Wrap it: onClick={() => cancel(3)}
//  - Do NOT call it: onClick={cancel(3)} runs during render, not on click.
//  - In a form, call event.preventDefault() so the page does not reload.
//
// These handlers only write to the console (open DevTools > Console).
// They cannot change what is on the page yet: that needs state, on Day 2.

import type { ChangeEvent, SubmitEvent } from "react";

function cancel(id: number) {
  console.log("Cancel clicked for leave", id);
  console.log(id)
}

function handleChange(event: ChangeEvent<HTMLInputElement>) {
  console.log("Typed:", event.target.value);
}

function handleSubmit( event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  console.log("Form submitted without reloading the page");
}

export default function EventHandling() {
  return (
    <div>
      <h2>Event handling</h2>
      <p className="note">Handlers log to the console. Open DevTools to see them.</p>

      <div className="demo row">
        <button onClick={() => cancel(1)}>Cancel</button>
        <button onClick={() => cancel(2)}>Cancel leave 1</button>
        <button onClick={() => cancel(3)}>Cancel leave 2</button>
      </div>

      <form className="demo form" onSubmit={handleSubmit}>
        <label>
          Reason
          <input onChange={handleChange} placeholder="Type here" />
        </label>
        <button className="primary" type="submit">
          Submit
        </button>
      </form>

    </div>
  );
}
