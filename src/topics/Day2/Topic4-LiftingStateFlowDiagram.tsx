// DAY 2 · TOPIC 4: Lifting state flow diagram
//
// A picture of the Lifting state up topic. The parent owns the state.
// Data flows DOWN to children as props (blue arrows).
// Changes flow UP when a child calls a function prop (orange arrows).
// The letters [B] [C] [D] [E] match the trainer markers in Topic4-LiftingStateUp.tsx.
// It is plain inline SVG using currentColor, so it works in light and dark themes.

const DOWN = "#2563eb"; // data flows down (props)
const UP = "#ea580c"; // changes flow up (function prop)

export default function LiftingStateFlowDiagram() {
  return (
    <figure className="demo" style={{ margin: "0 0 16px" }}>
      <svg
        viewBox="0 0 640 320"
        width="100%"
        role="img"
        aria-labelledby="flow-title flow-desc"
        style={{ maxWidth: 700, display: "block", margin: "0 auto", color: "inherit" }}
        fontFamily="system-ui, sans-serif"
      >
        <title id="flow-title">Lifting state up</title>
        <desc id="flow-desc">
          The parent LiftingStateUp owns the filter state. It passes values down as props to
          StatusFilter, Summary and LeaveTable. StatusFilter calls a function prop to ask the
          parent to change the filter.
        </desc>

        <defs>
          <marker id="arrow-down" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={DOWN} />
          </marker>
          <marker id="arrow-up" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={UP} />
          </marker>
        </defs>

        {/* Parent */}
        <rect x="150" y="10" width="340" height="80" rx="10" fill="rgba(37,99,235,0.12)" stroke={DOWN} strokeWidth="2" />
        <text x="320" y="36" textAnchor="middle" fontSize="17" fontWeight="700" fill="currentColor">
          LiftingStateUp (parent)  [B]
        </text>
        <text x="320" y="58" textAnchor="middle" fontSize="14" fill="currentColor">
          owns the only useState: filter
        </text>
        <text x="320" y="78" textAnchor="middle" fontSize="13" fill="currentColor" opacity="0.8">
          visible = list calculated from filter  [E]
        </text>

        {/* Down arrows: props */}
        <line x1="190" y1="90" x2="70" y2="210" stroke={DOWN} strokeWidth="2.5" markerEnd="url(#arrow-down)" />
        <line x1="320" y1="90" x2="320" y2="210" stroke={DOWN} strokeWidth="2.5" markerEnd="url(#arrow-down)" />
        <line x1="450" y1="90" x2="560" y2="210" stroke={DOWN} strokeWidth="2.5" markerEnd="url(#arrow-down)" />

        {/* Up arrow: function prop */}
        <line x1="110" y1="210" x2="230" y2="90" stroke={UP} strokeWidth="2.5" markerEnd="url(#arrow-up)" />

        {/* Arrow labels */}
        <text x="118" y="152" textAnchor="end" fontSize="13" fill={DOWN} fontWeight="600">
          value={"{filter}"}  [C]
        </text>
        <text x="182" y="152" fontSize="12" fill={UP} fontWeight="600">
          onChange={"{setFilter}"}
        </text>
        <text x="330" y="152" fontSize="13" fill={DOWN} fontWeight="600">
          filter, count
        </text>
        <text x="518" y="152" fontSize="13" fill={DOWN} fontWeight="600">
          leaves, filter
        </text>

        {/* Children */}
        <rect x="10" y="210" width="190" height="66" rx="10" fill="rgba(127,127,127,0.10)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
        <text x="105" y="236" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">StatusFilter  [D]</text>
        <text x="105" y="258" textAnchor="middle" fontSize="13" fill="currentColor">buttons, no state</text>

        <rect x="225" y="210" width="190" height="66" rx="10" fill="rgba(127,127,127,0.10)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
        <text x="320" y="236" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">Summary  [D]</text>
        <text x="320" y="258" textAnchor="middle" fontSize="13" fill="currentColor">reads only, no state</text>

        <rect x="440" y="210" width="190" height="66" rx="10" fill="rgba(127,127,127,0.10)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
        <text x="535" y="236" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">LeaveTable  [D]</text>
        <text x="535" y="258" textAnchor="middle" fontSize="13" fill="currentColor">reads only, no state</text>

        {/* Legend */}
        <line x1="60" y1="302" x2="100" y2="302" stroke={DOWN} strokeWidth="2.5" markerEnd="url(#arrow-down)" />
        <text x="108" y="306" fontSize="13" fill="currentColor">data flows DOWN as props</text>
        <line x1="360" y1="302" x2="400" y2="302" stroke={UP} strokeWidth="2.5" markerEnd="url(#arrow-up)" />
        <text x="408" y="306" fontSize="13" fill="currentColor">changes go UP by calling a function</text>
      </svg>
      <p className="try">Try it: follow one filter change. Which arrow carries the click up, and which carries the new list down?</p>
    </figure>
  );
}
