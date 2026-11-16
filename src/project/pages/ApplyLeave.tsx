import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ALLOWANCE, LEAVE_TYPES, workingDays } from "../../lib/leave";
import type { LeaveType } from "../../types";
import { useCreateLeave } from "../api/leaves";
import TextField from "../components/TextField";

type Form = { type: LeaveType; startDate: string; endDate: string; reason: string };

export default function ApplyLeave() {
  const navigate = useNavigate();
  const create = useCreateLeave();
  const [form, setForm] = useState<Form>({ type: "Annual", startDate: "", endDate: "", reason: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const update = (changes: Partial<Form>) => setForm({ ...form, ...changes });

  // Working days are calculated while rendering, never stored in state
  const datesOk = form.startDate !== "" && form.endDate !== "" && form.endDate >= form.startDate;
  const days = datesOk ? workingDays(form.startDate, form.endDate) : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!form.startDate) next.startDate = "Choose a start date.";
    if (!form.endDate) next.endDate = "Choose an end date.";
    else if (form.startDate && form.endDate < form.startDate) next.endDate = "The end date is before the start date.";
    if (!form.reason.trim()) next.reason = "Add a short reason for your manager.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // The SERVER also checks allowance and overlapping dates and answers 400 or 409
    create.mutate(form, { onSuccess: (leave) => navigate(`/leaves/${leave.id}`) });
  }

  return (
    <div>
      <h1>Apply for leave</h1>
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="type">Leave type</label>
          <select id="type" value={form.type} onChange={(e) => update({ type: e.target.value as LeaveType })}>
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>{type} ({ALLOWANCE[type] === null ? "no limit" : `${ALLOWANCE[type]} days a year`})</option>
            ))}
          </select>
        </div>
        <TextField id="startDate" label="Start date" type="date" value={form.startDate} error={errors.startDate}
          onChange={(e) => update({ startDate: e.target.value })} />
        <TextField id="endDate" label="End date" type="date" value={form.endDate} error={errors.endDate}
          onChange={(e) => update({ endDate: e.target.value })} />
        <p className="summary" aria-live="polite">
          {days === null ? "Choose both dates to see the working days." : days === 0 ? "These dates have no working days (weekend)." : `${days} working ${days === 1 ? "day" : "days"}, weekends excluded.`}
        </p>
        <TextField id="reason" label="Reason" value={form.reason} error={errors.reason} onChange={(e) => update({ reason: e.target.value })} />
        {/* Messages from the server, for example "Not enough Annual leave" (400) or overlap (409) */}
        {create.isError && <p className="message error" role="alert">Could not send your request: {create.error.message}</p>}
        <div className="row">
          <button className="primary" disabled={create.isPending}>{create.isPending ? "Sending…" : "Send request"}</button>
          <Link to="/leaves">Back to My leaves</Link>
        </div>
      </form>
    </div>
  );
}
