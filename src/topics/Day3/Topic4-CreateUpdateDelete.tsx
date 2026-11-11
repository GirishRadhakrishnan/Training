// DAY 3 · TOPIC 4: Create, update and delete
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
// isPending on a mutation drives the "Saving…" button. error shows what failed.

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeaveRequest, LeaveType, NewLeave } from "../../types";
import { LEAVE_TYPES, formatRange, workingDays } from "../../lib/leave";
import { createLeave, deleteLeave, getLeaves, updateLeave } from "../../api/leaves";

const empty = { type: "Annual" as LeaveType, startDate: "", endDate: "", reason: "" };

export default function CreateUpdateDelete() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null); // null = creating
  const [errors, setErrors] = useState<Record<string, string>>({});

  const leaves = useQuery({ queryKey: ["leaves"], queryFn: ({ signal }) => getLeaves({}, undefined, signal) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leaves"] });
  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };
  const save = useMutation({
    mutationFn: (leave: NewLeave) =>
      editingId === null ? createLeave(leave) : updateLeave(editingId, leave),
    onSuccess: reset,
    onSettled: refresh,
  });
  const remove = useMutation({ mutationFn: (id: number) => deleteLeave(id), onSettled: refresh });

  function startEdit(leave: LeaveRequest) {
    setEditingId(leave.id);
    setForm({ type: leave.type, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason });
    setErrors({});
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.startDate) next.startDate = "Choose a start date";
    if (!form.endDate) next.endDate = "Choose an end date";
    if (form.startDate && form.endDate && form.endDate < form.startDate) next.endDate = "End date is before start date";
    if (!form.reason.trim()) next.reason = "Enter a reason";
    setErrors(next);
    if (Object.keys(next).length === 0) save.mutate({ employee: "Asha Rao", ...form });
  }

  const days = form.startDate && form.endDate ? workingDays(form.startDate, form.endDate) : 0;

  return (
    <div>
      <h2>Create, update and delete</h2>
      <div className="demo">
        <h3>{editingId === null ? "Apply for leave" : `Edit request ${editingId}`}</h3>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Start date
            <input type="date" value={form.startDate} aria-invalid={!!errors.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            {errors.startDate && <span className="field-error">{errors.startDate}</span>}
          </label>
          <label>
            End date
            <input type="date" value={form.endDate} aria-invalid={!!errors.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </label>
          <label>
            Reason
            <input value={form.reason} aria-invalid={!!errors.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {errors.reason && <span className="field-error">{errors.reason}</span>}
          </label>
          <p className="muted">Working days: {days}</p>
          <div className="row">
            <button className="primary" disabled={save.isPending}>
              {save.isPending ? "Saving…" : editingId === null ? "Apply for leave" : "Save changes"}
            </button>
            {editingId !== null && <button type="button" onClick={reset}>Cancel edit</button>}
          </div>
          {save.isError && <p className="message error" role="alert">Could not save: {save.error.message}</p>}
        </form>
      </div>
      <h3>All requests</h3>
      {leaves.isPending && <p className="muted">Loading leave requests…</p>}
      {leaves.isError && <p className="message error">Could not load leave requests: {leaves.error.message}</p>}
      {leaves.data?.length === 0 && <p>No leave requests yet. Apply for one above.</p>}
      {leaves.data && leaves.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.data.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.employee}</td>
                <td>{leave.type}</td>
                <td>{formatRange(leave.startDate, leave.endDate)}</td>
                <td>{workingDays(leave.startDate, leave.endDate)}</td>
                <td><span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                <td>
                  <div className="row">
                    <button onClick={() => startEdit(leave)} aria-label={`Edit request ${leave.id}`}>Edit</button>
                    <button className="danger" onClick={() => remove.mutate(leave.id)}
                      disabled={remove.isPending} aria-label={`Delete request ${leave.id}`}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {remove.isError && <p className="message error" role="alert">Could not delete: {remove.error.message}</p>}
      <p className="try">
        Try it: submit the empty form, then a valid one. Click Edit on a row, change the reason
        and save. Then pass { "{ fail: true }" } as the last argument of deleteLeave and watch the error.
      </p>
    </div>
  );
}
