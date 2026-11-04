// DAY 2 · TOPIC 3: Controlled forms
//
// In a controlled form, React state is the single source of truth. Every input
// shows `value` from state and updates it in onChange.
//
// One change handler can serve every field: give each input a `name` equal to
// its key in the state object and use [e.target.name] as the key to update.
//
// Validate on submit and show a message next to each wrong field. Mark the field
// with aria-invalid so screen readers announce the problem.
//
// "Working days requested" is not stored in state. It is calculated from the
// start and end dates during every render, so it can never get out of date.

import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import type { NewLeave } from "../../types";
import { LEAVE_TYPES, workingDays } from "../../lib/leave";

type Errors = Partial<Record<keyof NewLeave, string>>;

const emptyForm: NewLeave = {
  employee: "Asha Rao",
  type: "Annual",
  startDate: "",
  endDate: "",
  reason: "",
};

function validate(form: NewLeave): Errors {
  const errors: Errors = {};
  if (!form.startDate) errors.startDate = "Choose a start date.";
  if (!form.endDate) errors.endDate = "Choose an end date.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date cannot be before the start date.";
  }
  if (form.reason.trim().length < 3) errors.reason = "Enter a reason of at least 3 characters.";
  return errors;
}

export default function ControlledForms() {
  const [form, setForm] = useState<NewLeave>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitted("");
      return;
    }
    setSubmitted(`${form.type} leave, ${form.startDate} to ${form.endDate}, "${form.reason.trim()}"`);
    setForm(emptyForm);
  }

  // Derived during render, not state
  const days =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? workingDays(form.startDate, form.endDate)
      : 0;

  return (
    <div>
      <h2>Controlled forms</h2>
      <form className="form demo" onSubmit={handleSubmit} noValidate>
        <label>
          Leave type
          <select name="type" value={form.type} onChange={handleChange}>
            {LEAVE_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Start date
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            aria-invalid={errors.startDate ? true : undefined}
          />
          {errors.startDate && <p className="field-error">{errors.startDate}</p>}
        </label>

        <label>
          End date
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            aria-invalid={errors.endDate ? true : undefined}
          />
          {errors.endDate && <p className="field-error">{errors.endDate}</p>}
        </label>

        <label>
          Reason
          <textarea
            name="reason"
            rows={3}
            value={form.reason}
            onChange={handleChange}
            aria-invalid={errors.reason ? true : undefined}
          />
          {errors.reason && <p className="field-error">{errors.reason}</p>}
        </label>

        <p>Working days requested: {days}</p>
        <div>
          <button type="submit" className="primary">
            Submit request
          </button>
        </div>
        {submitted && <p className="message">Submitted: {submitted}</p>}
      </form>
      <p className="try">
        Try it: submit the empty form and read the messages. Then pick Friday to Monday and
        check "Working days requested". Why is that value not in useState?
      </p>
    </div>
  );
}
