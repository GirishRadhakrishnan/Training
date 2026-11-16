import { useRef, useState } from "react";
import { ALLOWANCE, LEAVE_TYPES } from "../../lib/leave";
import { useMyLeaves } from "../api/leaves";
import ApplyForm from "../components/ApplyForm";
import BalanceCard from "../components/BalanceCard";
import HistoryCard from "../components/HistoryCard";
import { LoadError, Loading } from "../components/Status";
import TrackerCard from "../components/TrackerCard";

// The Leaves dashboard. ONE query feeds every card. The balances, the tracker and the
// table are all calculated from that list while rendering, so when a request is sent or
// cancelled, one invalidation updates the whole screen.
export default function MyLeaves() {
  const leaves = useMyLeaves();
  const [showPolicy, setShowPolicy] = useState(false);
  const typeSelect = useRef<HTMLSelectElement>(null);
  const year = String(new Date().getFullYear());

  return (
    <div>
      <div className="lv-header">
        <h1>Leaves</h1>
        <div className="row">
          <span className="lv-range">01/01/{year} - 31/12/{year}</span>
          <button type="button" aria-expanded={showPolicy} onClick={() => setShowPolicy(!showPolicy)}>View policy</button>
          <button type="button" className="primary" onClick={() => typeSelect.current?.focus()}>Apply for leave</button>
        </div>
      </div>
      {showPolicy && (
        <p className="message" role="note">
          Yearly allowance: {LEAVE_TYPES.map((t) => `${t} ${ALLOWANCE[t] ?? "no limit"}`).join(", ")}. Weekends are not
          counted. Pending and approved requests use up your balance; rejected and cancelled ones do not.
        </p>
      )}

      {leaves.isPending && <Loading what="your leave requests" />}
      {leaves.isError && <LoadError what="your leave requests" error={leaves.error} onRetry={() => leaves.refetch()} />}
      {leaves.data && (
        <div className="lv-grid">
          <BalanceCard leaves={leaves.data} year={year} />
          <ApplyForm leaves={leaves.data} year={year} ref={typeSelect} />
          <TrackerCard leaves={leaves.data} />
          <HistoryCard leaves={leaves.data} />
        </div>
      )}
    </div>
  );
}
