// DAY 3 · TOPIC 1: Recap: state and hooks
//
// Props are data a component RECEIVES. State is data a component REMEMBERS.
// A normal variable is reset every time the function runs, so it cannot remember.
// State lives inside React and survives between runs of your component.
//
// A hook is a function whose name starts with "use". It lets a component "hook into"
// a React feature. useState is the first one: const [value, setValue] = useState(start).
// Rules: call hooks at the top of the component, never inside if, loops or after a return.
//
// The first diagram shows what state is; the second shows the loop.
// The loop (see the diagram): state -> screen -> click -> setState -> React renders again.
// Never change state directly (cart.push(...)). Always call the setter with a NEW value.
// The total and the item count are calculated while rendering, not stored in state.
// You met this on Day 2. Day 3 builds on it: server data will NOT live in useState (next topics).

import { useState } from "react";

type Product = { id: string; name: string; price: number };

const products: Product[] = [
  { id: "p1", name: "Notebook", price: 120 },
  { id: "p2", name: "Pen set", price: 80 },
  { id: "p3", name: "Desk lamp", price: 650 },
];

const ARROW = "#2563eb";

function Box({ x, y, title, code }: { x: number; y: number; title: string; code: string }) {
  return (
    <g>
      <rect x={x} y={y} width="260" height="80" rx="10" fill="rgba(37,99,235,0.10)" stroke={ARROW} strokeWidth="2" />
      <text x={x + 130} y={y + 32} textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">{title}</text>
      <text x={x + 130} y={y + 56} textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">{code}</text>
    </g>
  );
}

function WhatIsStateDiagram() {
  return (
    <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="What is state: a component function forgets its variables on every run, while React keeps state in its own memory"
      style={{ maxWidth: 700, display: "block", margin: "0 auto" }} fontFamily="system-ui, sans-serif">
      <defs>
        <marker id="state-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={ARROW} />
        </marker>
      </defs>
      <text x="320" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">State = data a component remembers between renders</text>

      {/* Component function */}
      <rect x="20" y="40" width="270" height="240" rx="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
      <text x="155" y="66" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">Your component function</text>
      <text x="155" y="84" textAnchor="middle" fontSize="12" fill="currentColor">runs again on every render</text>
      <rect x="40" y="100" width="230" height="64" rx="8" fill="rgba(220,38,38,0.10)" stroke="#dc2626" strokeWidth="2" />
      <text x="155" y="124" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">let count = 0</text>
      <text x="155" y="146" textAnchor="middle" fontSize="12" fill="currentColor">normal variable: forgotten</text>
      <rect x="40" y="190" width="230" height="64" rx="8" fill="rgba(37,99,235,0.10)" stroke={ARROW} strokeWidth="2" />
      <text x="155" y="214" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">const [cart, setCart]</text>
      <text x="155" y="236" textAnchor="middle" fontSize="12" fill="currentColor">state: given back by React</text>

      {/* React memory */}
      <rect x="350" y="40" width="270" height="240" rx="10" fill="rgba(37,99,235,0.10)" stroke={ARROW} strokeWidth="2" />
      <text x="485" y="66" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">React's memory</text>
      <text x="485" y="84" textAnchor="middle" fontSize="12" fill="currentColor">lives outside your function</text>
      <rect x="380" y="100" width="210" height="64" rx="8" fill="rgba(37,99,235,0.15)" stroke={ARROW} strokeWidth="2" />
      <text x="485" y="124" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">cart = ["p1", "p3"]</text>
      <text x="485" y="146" textAnchor="middle" fontSize="12" fill="currentColor">survives every render</text>
      <text x="485" y="214" textAnchor="middle" fontSize="12" fill="currentColor">Change it only with the setter:</text>
      <text x="485" y="234" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">setCart([...cart, id])</text>

      {/* Arrows between the two */}
      <g stroke={ARROW} strokeWidth="2.5" markerEnd="url(#state-arrow)">
        <line x1="380" y1="178" x2="292" y2="178" />
        <line x1="292" y1="266" x2="380" y2="266" />
      </g>
      <text x="336" y="172" textAnchor="middle" fontSize="11" fill="currentColor">current value</text>
      <text x="336" y="288" textAnchor="middle" fontSize="11" fill="currentColor">new value</text>
    </svg>
  );
}

function StateLoopDiagram() {
  return (
    <svg viewBox="0 0 640 290" width="100%" role="img" aria-label="State loop: state, render, click, setter, render again"
      style={{ maxWidth: 700, display: "block", margin: "0 auto" }} fontFamily="system-ui, sans-serif">
      <defs>
        <marker id="loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={ARROW} />
        </marker>
      </defs>
      <Box x={20} y={20} title="1. State remembered by React" code="const [cart, setCart] = useState([])" />
      <Box x={360} y={20} title="2. Component renders" code="screen = f(cart)" />
      <Box x={360} y={190} title="3. User clicks Add to cart" code="onClick={() => add(id)}" />
      <Box x={20} y={190} title="4. Setter called with a NEW value" code="setCart([...cart, id])" />
      <g stroke={ARROW} strokeWidth="2.5" markerEnd="url(#loop-arrow)">
        <line x1="280" y1="60" x2="358" y2="60" />
        <line x1="490" y1="100" x2="490" y2="188" />
        <line x1="360" y1="230" x2="282" y2="230" />
        <line x1="150" y1="190" x2="150" y2="102" />
      </g>
      <text x="320" y="138" textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">React renders again with the new state</text>
      <text x="320" y="160" textAnchor="middle" fontSize="13" fill="currentColor">useState is a hook: a function starting with "use"</text>
    </svg>
  );
}

export default function RecapStateAndHooks() {
  const [cart, setCart] = useState<string[]>([]); // product ids, one entry per add

  function add(id: string) {
    setCart([...cart, id]); // new array, never cart.push
  }

  // Calculated every render, not stored
  const total = cart.reduce((sum, id) => sum + (products.find((p) => p.id === id)?.price ?? 0), 0);

  return (
    <div>
      <figure className="demo" style={{ margin: "0 0 16px" }}>
        <WhatIsStateDiagram />
      </figure>

      <figure className="demo" style={{ margin: "0 0 16px" }}>
        <StateLoopDiagram />
      </figure>

      <div className="demo">
        <h3>Shop</h3>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name}: ₹{p.price} <button onClick={() => add(p.id)}>Add to cart</button>
            </li>
          ))}
        </ul>
        <h3>Cart ({cart.length})</h3>
        {cart.length === 0 ? <p>Your cart is empty. Add a product above.</p> : <p>Total: ₹{total}</p>}
        <button onClick={() => setCart([])} disabled={cart.length === 0}>Clear cart</button>
      </div>

      <p className="try">
        Try it: replace the body of add with cart.push(id) and click. The screen does not update.
        Why? React was never told that state changed. Undo it, then add a "Remove last item" button.
      </p>
    </div>
  );
}
