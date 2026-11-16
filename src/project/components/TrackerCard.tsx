import { formatRange, workingDays } from "../../lib/leave";
import type { LeaveRequest } from "../../types";
import { dayWord } from "../balance";

// First Monday-to-Friday day after the last day of leave
function returnDate(end: string): string {
  const day = new Date(`${end}T00:00:00`);
  do day.setDate(day.getDate() + 1);
  while (day.getDay() === 0 || day.getDay() === 6);
  return day.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Donut chart: the blue arc is the share of working days already taken
function Donut({ done, total, label }: { done: number; total: number; label: string }) {
  const radius = 70;
  const length = 2 * Math.PI * radius;
  const share = total === 0 ? 0 : Math.min(done / total, 1);
  return (
    <svg className="lv-donut" viewBox="0 0 180 180" role="img" aria-label={label}>
      <circle cx="90" cy="90" r={radius} className="lv-donut-track" />
      <circle cx="90" cy="90" r={radius} className="lv-donut-arc" transform="rotate(-90 90 90)"
        strokeDasharray={length} strokeDashoffset={length * (1 - share)} />
      <text x="90" y="90" textAnchor="middle" className="lv-donut-text">{label}</text>
    </svg>
  );
}

// Shows the next leave that is Approved or Pending and not over yet
export default function TrackerCard({ leaves }: { leaves: LeaveRequest[] }) {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  const upcoming = leaves
    .filter((leave) => (leave.status === "Approved" || leave.status === "Pending") && leave.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  return (
    <section className="lv-card lv-tracker" aria-labelledby="tracker-title">
      <h3 id="tracker-title">Leave tracker</h3>
      {!upcoming && <p className="muted">You have no upcoming leave. Apply for leave to see it here.</p>}
      {upcoming && <Upcoming leave={upcoming} today={today} />}
    </section>
  );
}

function Upcoming({ leave, today }: { leave: LeaveRequest; today: string }) {
  const started = leave.startDate <= today;
  const total = workingDays(leave.startDate, leave.endDate);
  const done = started ? workingDays(leave.startDate, today) : 0;
  return (
    <>
      <p className="lv-tracker-title">
        <b>{leave.type} leave</b> <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
      </p>
      <p className="muted">{formatRange(leave.startDate, leave.endDate)}</p>
      <Donut done={done} total={total} label={started ? `Day ${done} of ${total}` : `${total} ${dayWord(total)}`} />
      <p className="muted lv-center">
        {started ? "In progress" : "Not started yet"} · Return date: {returnDate(leave.endDate)}
      </p>
    </>
  );
}
