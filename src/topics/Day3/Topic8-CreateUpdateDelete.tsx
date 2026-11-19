// DAY 3 · TOPIC 8: Create, update and delete
//
// useQuery reads. useMutation writes (POST, PATCH, DELETE). It does not run by
// itself: you call mutate(variables) from an event handler.
//
// After ANY mutation the cached list may be wrong, so we invalidate it:
//   onSettled: () => queryClient.invalidateQueries({ queryKey: ["leaves"] })
// onSettled runs after success AND failure. TanStack Query then refetches, and
// the screen shows what the server really has.
//
// The form's own text lives in useState (UI state). The list of leaves is NEVER
// copied into useState: the table reads it from useQuery on every render.
// Edit loads a row into the form and saves with PATCH. Delete sends DELETE.
// isPending on a mutation drives the "Sending…" button. error shows what failed.
// The form also follows basic UX rules: visible labels, hints, errors shown next to the field
// (after the user leaves it or submits), focus moved to the first error, a live summary, a success message.
//
// The screen is laid out as a Leaves dashboard. Everything on it is calculated from the one
// ["leaves"] query: the balance cards, the tracker and the history table. Nothing is stored,
// so when a request is created, edited or deleted, invalidating the query updates all of them.

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeaveRequest, LeaveStatus, LeaveType, NewLeave } from "../../types";
import {
  ALLOWANCE,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  daysByStatus,
  formatRange,
  workingDays,
} from "../../lib/leave";
import { createLeave, deleteLeave, getLeaves, updateLeave } from "../../api/leaves";

const EMPLOYEE = "Asha Rao";
const REASON_MAX = 200;
const empty = { type: "Annual" as LeaveType, startDate: "", endDate: "", reason: "" };

type Form = typeof empty;
type Field = "startDate" | "endDate" | "reason";
type Errors = Partial<Record<Field, string>>;
const FIELD_ORDER: Field[] = ["startDate", "endDate", "reason"];
const FIELD_ID: Record<Field, string> = { startDate: "leave-start", endDate: "leave-end", reason: "leave-reason" };

const dayWord = (n: number) => (n === 1 ? "day" : "days");

// Pure function: the errors are calculated from the form on every render, never stored
function validate(form: Form, days: number, remaining: number | null): Errors {
  const errors: Errors = {};
  if (!form.startDate) errors.startDate = "Choose the first day of your leave.";
  if (!form.endDate) errors.endDate = "Choose the last day of your leave.";
  else if (form.startDate && form.endDate < form.startDate) errors.endDate = "The last day cannot be before the first day.";
  else if (form.startDate && days === 0) errors.endDate = "These dates are only weekend days, so no leave is needed.";
  else if (remaining !== null && days > remaining)
    errors.endDate = `You have ${remaining} ${form.type.toLowerCase()} ${dayWord(remaining)} left, and this request needs ${days}.`;
  if (!form.reason.trim()) errors.reason = "Add a short reason for your manager.";
  return errors;
}

// Label + control + one line of help or error, wired together for screen readers
function FormField(props: { id: string; label: string; error?: string; children: ReactNode }) {
  const { id, label, error, children } = props;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-msg`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

const longDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// First Monday-to-Friday day after the last day of leave
function returnDate(end: string): string {
  const day = new Date(`${end}T00:00:00`);
  do day.setDate(day.getDate() + 1);
  while (day.getDay() === 0 || day.getDay() === 6);
  return day.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Donut chart: the blue arc is the share of working days already taken
function Donut(props: { done: number; total: number; label: string }) {
  const radius = 70;
  const length = 2 * Math.PI * radius;
  const share = props.total === 0 ? 0 : Math.min(props.done / props.total, 1);
  return (
    <svg className="lv-donut" viewBox="0 0 180 180" role="img" aria-label={props.label}>
      <circle cx="90" cy="90" r={radius} className="lv-donut-track" />
      <circle
        cx="90" cy="90" r={radius} className="lv-donut-arc" transform="rotate(-90 90 90)"
        strokeDasharray={length} strokeDashoffset={length * (1 - share)}
      />
      <text x="90" y="90" textAnchor="middle" className="lv-donut-text">{props.label}</text>
    </svg>
  );
}

export default function CreateUpdateDelete() {
  const queryClient = useQueryClient();
  const [showPolicy, setShowPolicy] = useState(false);
  const [filters, setFilters] = useState({ year: "All", type: "All", status: "All" });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null); // null = creating
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const leaves = useQuery({ queryKey: ["leaves"], queryFn: ({ signal }) => getLeaves({}, undefined, signal) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leaves"] });
  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setTouched({});
    setSubmitted(false);
  };
  const save = useMutation({
    mutationFn: (leave: NewLeave) =>
      editingId === null ? createLeave(leave) : updateLeave(editingId, leave),
    onSuccess: () => {
      setNotice(editingId === null ? "Request sent. It is at the top of the table below." : "Changes saved.");
      reset();
    },
    onSettled: refresh,
  });
  const remove = useMutation({ mutationFn: (id: number) => deleteLeave(id), onSettled: refresh });

  function update(changes: Partial<Form>) {
    setForm({ ...form, ...changes });
    setNotice(null);
  }

  function startEdit(leave: LeaveRequest) {
    setEditingId(leave.id);
    setForm({ type: leave.type, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason });
    setTouched({});
    setSubmitted(false);
    setNotice(null);
  }

  // Deleting cannot be undone, so ask first. Only a click on OK sends the DELETE request.
  function confirmDelete(leave: LeaveRequest) {
    const ok = window.confirm(
      `Are you sure you want to delete this leave request?\n\n${leave.employee}: ${leave.type}, ${formatRange(leave.startDate, leave.endDate)}`,
    );
    if (ok) remove.mutate(leave.id);
  }

  // Calculated on every render, never stored
  const validRange = form.startDate !== "" && form.endDate >= form.startDate;
  const days = validRange ? workingDays(form.startDate, form.endDate) : 0;
  const allowance = ALLOWANCE[form.type];
  const myLeaves = (leaves.data ?? []).filter((l) => l.employee === EMPLOYEE && l.id !== editingId);
  const used = daysByStatus(myLeaves, form.type, "Approved") + daysByStatus(myLeaves, form.type, "Pending");
  const remaining = leaves.data && allowance !== null ? allowance - used : null;
  const errors = validate(form, days, remaining);
  const shown = (field: Field) => (submitted || touched[field] ? errors[field] : undefined);
  const touch = (field: Field) => setTouched({ ...touched, [field]: true });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setNotice(null);
    const firstError = FIELD_ORDER.find((field) => errors[field]);
    if (firstError) {
      document.getElementById(FIELD_ID[firstError])?.focus(); // take the user to the first problem
      return;
    }
    save.mutate({ employee: EMPLOYEE, ...form });
  }

  // Everything below is derived during render from leaves.data: nothing is stored
  const mine = (leaves.data ?? []).filter((l) => l.employee === EMPLOYEE);
  const balance = (type: LeaveType) => {
    const limit = ALLOWANCE[type];
    const taken = daysByStatus(mine, type, "Approved") + daysByStatus(mine, type, "Pending");
    return limit === null ? null : limit - taken;
  };

  // Tracker: the next leave that is approved or pending and not over yet
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  const upcoming = mine
    .filter((l) => (l.status === "Approved" || l.status === "Pending") && l.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const started = upcoming !== undefined && upcoming.startDate <= today;
  const trackerTotal = upcoming ? workingDays(upcoming.startDate, upcoming.endDate) : 0;
  const trackerDone = started ? workingDays(upcoming.startDate, today) : 0;

  // History: newest first (highest id), then the filters. Sorted on a copy: sort changes its array.
  const years = [...new Set(mine.map((l) => l.startDate.slice(0, 4)))].sort().reverse();
  const history = [...mine]
    .sort((a, b) => b.id - a.id)
    .filter((l) => filters.year === "All" || l.startDate.startsWith(filters.year))
    .filter((l) => filters.type === "All" || l.type === filters.type)
    .filter((l) => filters.status === "All" || l.status === filters.status);
  const setFilter = (name: keyof typeof filters, value: string) => setFilters({ ...filters, [name]: value });

  function goToForm() {
    const first = document.getElementById("leave-type");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    first?.focus({ preventScroll: true });
  }

  return (
    <div className="lv">
      <div className="lv-header">
        <h2>Leaves</h2>
        <div className="row">
          <span className="lv-range">01/01/{today.slice(0, 4)} - 31/12/{today.slice(0, 4)}</span>
          <button type="button" aria-expanded={showPolicy} onClick={() => setShowPolicy(!showPolicy)}>
            View policy
          </button>
          <button type="button" className="primary" onClick={goToForm}>Apply for leave</button>
        </div>
      </div>
      {showPolicy && (
        <p className="message" role="note">
          Yearly allowance: {LEAVE_TYPES.map((t) => `${t} ${ALLOWANCE[t] ?? "no limit"}`).join(", ")}. Weekends are
          not counted. Pending and approved requests use up your balance; rejected and cancelled ones do not.
        </p>
      )}

      <div className="lv-grid">
        <section className="lv-card lv-balance" aria-labelledby="lv-balance-title">
          <h3 id="lv-balance-title">Leave balance</h3>
          <div className="lv-balance-row">
            {LEAVE_TYPES.map((type) => {
              const left = balance(type);
              return (
                <div key={type} className="lv-stat">
                  <span className="muted">{type} leave</span>
                  <p>
                    <b>{leaves.data ? (left === null ? "No limit" : left) : "…"}</b>
                    {left !== null && leaves.data && <span className="muted"> {left === 1 ? "day" : "days"} left</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lv-card lv-apply" aria-labelledby="lv-apply-title">
          <h3 id="lv-apply-title">{editingId === null ? "Apply for leave" : `Edit request ${editingId}`}</h3>
          {notice && (
            <p className="message success" role="status">
              {notice}
            </p>
          )}
          <form className="apply-form" onSubmit={handleSubmit} noValidate>
            <div className="dates">
              <FormField id="leave-type" label="Leave type">
                <select id="leave-type" value={form.type} onChange={(e) => update({ type: e.target.value as LeaveType })}>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField id={FIELD_ID.startDate} label="First day" error={shown("startDate")}>
                <input
                  id={FIELD_ID.startDate}
                  type="date"
                  value={form.startDate}
                  aria-invalid={!!shown("startDate")}
                  aria-describedby={`${FIELD_ID.startDate}-msg`}
                  onChange={(e) => update({ startDate: e.target.value })}
                  onBlur={() => touch("startDate")}
                />
              </FormField>
              <FormField id={FIELD_ID.endDate} label="Last day" error={shown("endDate")}>
                <input
                  id={FIELD_ID.endDate}
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  aria-invalid={!!shown("endDate")}
                  aria-describedby={`${FIELD_ID.endDate}-msg`}
                  onChange={(e) => update({ endDate: e.target.value })}
                  onBlur={() => touch("endDate")}
                />
              </FormField>
            </div>

            <FormField id={FIELD_ID.reason} label="Reason" error={shown("reason")}>
              <input
                id={FIELD_ID.reason}
                maxLength={REASON_MAX}
                value={form.reason}
                aria-invalid={!!shown("reason")}
                aria-describedby={`${FIELD_ID.reason}-msg`}
                onChange={(e) => update({ reason: e.target.value })}
                onBlur={() => touch("reason")}
              />
            </FormField>

            <div className="form-footer">
              <p className={remaining !== null && days > remaining ? "summary warn" : "summary"} aria-live="polite">
                {days > 0 ? (
                  <b>
                    {days} working {dayWord(days)}
                  </b>
                ) : (
                  "Pick your dates"
                )}
                {" · "}
                {allowance === null
                  ? `${form.type} has no limit`
                  : remaining !== null &&
                    `${remaining} of ${allowance} left${days > 0 && remaining >= days ? `, ${remaining - days} after` : ""}`}
              </p>
              <div className="row">
                {editingId !== null && (
                  <button type="button" onClick={reset}>
                    Cancel
                  </button>
                )}
                <button className="primary" disabled={save.isPending}>
                  {save.isPending ? "Sending…" : editingId === null ? "Send request" : "Save changes"}
                </button>
              </div>
            </div>
            {save.isError && (
              <p className="message error" role="alert">
                Could not send your request: {save.error.message}. Your answers are kept. Try again.
              </p>
            )}
          </form>
        </section>

        <section className="lv-card lv-tracker" aria-labelledby="lv-tracker-title">
          <h3 id="lv-tracker-title">Leave tracker</h3>
          {leaves.isPending && <p className="muted">Loading your next leave…</p>}
          {leaves.data && !upcoming && <p className="muted">You have no upcoming leave. Apply for leave to see it here.</p>}
          {upcoming && (
            <>
              <p className="lv-tracker-title">
                <b>{upcoming.type} leave</b>{" "}
                <span className={`badge ${upcoming.status.toLowerCase()}`}>{upcoming.status}</span>
              </p>
              <p className="muted">{formatRange(upcoming.startDate, upcoming.endDate)}</p>
              <Donut
                done={trackerDone}
                total={trackerTotal}
                label={started ? `Day ${trackerDone} of ${trackerTotal}` : `${trackerTotal} ${dayWord(trackerTotal)}`}
              />
              <p className="muted lv-center">
                {started ? "In progress" : `Starts ${longDate(upcoming.startDate)}`} · Return date:{" "}
                {returnDate(upcoming.endDate)}
              </p>
            </>
          )}
        </section>

        <section className="lv-card lv-history" aria-labelledby="lv-history-title">
          <div className="lv-history-head">
            <h3 id="lv-history-title">Leave history</h3>
            <div className="row">
              <select aria-label="Year" value={filters.year} onChange={(e) => setFilter("year", e.target.value)}>
                <option value="All">All years</option>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <select aria-label="Type" value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
                <option value="All">All types</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select aria-label="Status" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="All">All statuses</option>
                {LEAVE_STATUSES.map((s: LeaveStatus) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {leaves.isPending && <p className="muted">Loading your leave history…</p>}
          {leaves.isError && (
            <p className="message error" role="alert">
              Could not load your leave history: {leaves.error.message}{" "}
              <button type="button" onClick={() => leaves.refetch()}>Retry</button>
            </p>
          )}
          {leaves.data && mine.length === 0 && <p>You have not applied for any leave yet. Use the form above.</p>}
          {mine.length > 0 && history.length === 0 && <p>No requests match these filters. Change a filter to see more.</p>}
          {history.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Type</th><th>Date range</th><th>Days</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.type} leave</td>
                    <td>{formatRange(leave.startDate, leave.endDate)}</td>
                    <td>{workingDays(leave.startDate, leave.endDate)}</td>
                    <td><span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                    <td>
                      <div className="row">
                        <button onClick={() => { startEdit(leave); goToForm(); }} aria-label={`Edit request ${leave.id}`}>Edit</button>
                        <button className="danger" onClick={() => confirmDelete(leave)}
                          disabled={remove.isPending} aria-label={`Delete request ${leave.id}`}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {remove.isError && <p className="message error" role="alert">Could not delete: {remove.error.message}</p>}
        </section>
      </div>
      <p className="try">
        Try it: send a request and watch the balance card and the history table change without a reload. Press Send
        request with an empty form and see where focus goes. Click Edit on a row, change the reason and save. Then pass
        { " { fail: true } " } as the last argument of deleteLeave and watch the error.
      </p>
    </div>
  );
}
