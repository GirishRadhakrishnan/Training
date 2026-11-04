// DAY 1 · TOPIC 8: Styling
//
// Three tools, each for one job:
//  - CSS Modules (Topic8-Styling.module.css): class names are local to this file,
//    so .panel here never clashes with .panel elsewhere.
//  - Global CSS (styles.css): shared classes like .badge used everywhere.
//  - Inline style: only for values known at runtime, like a width in percent.
// Build class names with a template string for conditional styling.

import styles from "./Topic8-Styling.module.css";
import { sampleLeaves } from "../../sample/leaves";

export default function Styling() {
  const used = 7; // days of annual leave used (calculated in real apps)
  const total = 18;
  const percent = Math.round((used / total) * 100);

  return (
    <div>
      <h2>Styling</h2>

      <div className={styles.panel}>
        <h3 className={styles.title}>CSS Module panel</h3>
        <p>This panel and its title use classes from Topic8-Styling.module.css.</p>
      </div>

      <div className="demo">
        <h3>Global badge classes</h3>
        <span className="badge pending">Pending</span>{" "}
        <span className="badge approved">Approved</span>{" "}
        <span className="badge rejected">Rejected</span>{" "}
        <span className="badge cancelled">Cancelled</span>
      </div>

      <div className="demo">
        <h3>Conditional class names</h3>
        {sampleLeaves.slice(0, 4).map((leave) => (
          <p
            key={leave.id}
            className={leave.status === "Pending" ? styles.highlight : undefined}
          >
            {leave.employee}:{" "}
            <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
          </p>
        ))}
      </div>

      <div className="demo">
        <h3>Inline style for a runtime value</h3>
        <p>
          Annual leave used: {used} of {total} days ({percent}%)
        </p>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      
    </div>
  );
}
