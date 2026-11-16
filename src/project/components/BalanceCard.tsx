import { LEAVE_TYPES } from "../../lib/leave";
import type { LeaveRequest } from "../../types";
import { dayWord, daysLeft } from "../balance";

export default function BalanceCard({ leaves, year }: { leaves: LeaveRequest[]; year: string }) {
  return (
    <section className="lv-card lv-balance" aria-labelledby="balance-title">
      <h3 id="balance-title">Leave balance</h3>
      <div className="lv-balance-row">
        {LEAVE_TYPES.map((type) => {
          const left = daysLeft(leaves, type, year);
          return (
            <div key={type} className="lv-stat">
              <span className="muted">{type} leave</span>
              <p>
                <b>{left === null ? "No limit" : left}</b>
                {left !== null && <span className="muted"> {dayWord(left)} left</span>}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
