import { useRef, useState } from "react";
import type { FormEvent, Ref } from "react";
import { ALLOWANCE, LEAVE_TYPES, workingDays } from "../../lib/leave";
import type { LeaveRequest, LeaveType } from "../../types";
import { useCreateLeave } from "../api/leaves";
import { dayWord, daysLeft } from "../balance";
import TextField from "./TextField";

type Form = { type: LeaveType; startDate: string; endDate: string; reason: string };
type Errors = Partial<Record<"startDate" | "endDate" | "reason", string>>;
const empty: Form = { type: "Annual", startDate: "", endDate: "", reason: "" };

// "ref" is a normal prop in React 19: the page uses it to focus the leave type select.
export default function ApplyForm({ leaves, year, ref }: { leaves: LeaveRequest[]; year: string; ref?: Ref<HTMLSelectElement> }) {
  const create = useCreateLeave();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  const update = (changes: Partial<Form>) => {
    setForm({ ...form, ...changes });
    setSent(false);
  };

  // Calculated while rendering, never stored in state
  const validRange = form.startDate !== "" && form.endDate >= form.startDate;
  const days = validRange ? workingDays(form.startDate, form.endDate) : 0;
  const allowance = ALLOWANCE[form.type];
  const left = daysLeft(leaves, form.type, form.startDate.slice(0, 4) || year);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!form.startDate) next.startDate = "Choose the first day of your leave.";
    if (!form.endDate) next.endDate = "Choose the last day of your leave.";
    else if (form.startDate && form.endDate < form.startDate) next.endDate = "The last day cannot be before the first day.";
    else if (form.startDate && days === 0) next.endDate = "These dates are only weekend days, so no leave is needed.";
    if (!form.reason.trim()) next.reason = "Add a short reason for your manager.";
    setErrors(next);
    const first = next.startDate ? startRef : next.endDate ? endRef : next.reason ? reasonRef : null;
    if (first) return first.current?.focus(); // take the user to the first problem

    // The SERVER also checks allowance and overlapping dates and answers 400 or 409
    create.mutate(form, {
      onSuccess: () => {
        setForm(empty);
        setSent(true);
      },
    });
  }

  return (
    <section className="lv-card lv-apply" aria-labelledby="apply-title">
      <h3 id="apply-title">Apply for leave</h3>
      {sent && <p className="message success" role="status">Request sent. It is in the history table below.</p>}
      <form className="apply-form" onSubmit={submit} noValidate>
        <div className="dates">
          <div className="field">
            <label htmlFor="leave-type">Leave type</label>
            <select id="leave-type" ref={ref} value={form.type} onChange={(e) => update({ type: e.target.value as LeaveType })}>
              {LEAVE_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <TextField id="startDate" label="First day" type="date" ref={startRef} value={form.startDate}
            error={errors.startDate} onChange={(e) => update({ startDate: e.target.value })} />
          <TextField id="endDate" label="Last day" type="date" ref={endRef} min={form.startDate || undefined} value={form.endDate}
            error={errors.endDate} onChange={(e) => update({ endDate: e.target.value })} />
        </div>
        <TextField id="reason" label="Reason" ref={reasonRef} maxLength={200} value={form.reason}
          error={errors.reason} onChange={(e) => update({ reason: e.target.value })} />

        <div className="form-footer">
          <p className={left !== null && days > left ? "summary warn" : "summary"} aria-live="polite">
            {days > 0 ? <b>{days} working {dayWord(days)}</b> : "Pick your dates"}
            {" · "}
            {allowance === null ? `${form.type} has no limit` : `${left} of ${allowance} left`}
          </p>
          <button className="primary" disabled={create.isPending}>{create.isPending ? "Sending…" : "Send request"}</button>
        </div>
        {/* Messages from the server, for example "Not enough Annual leave" (400) or overlapping dates (409) */}
        {create.isError && <p className="message error" role="alert">Could not send your request: {create.error.message}. Your answers are kept. Try again.</p>}
      </form>
    </section>
  );
}
