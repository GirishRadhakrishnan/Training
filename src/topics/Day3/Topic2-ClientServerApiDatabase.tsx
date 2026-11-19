// DAY 3 · TOPIC 2: Client, server, API and database
//
// A React app runs in the browser (the client). It does not talk to the database.
// It sends an HTTP request to an API on a backend server. The backend checks the
// request, asks the database for the data, and sends the answer back as JSON.
//
//   React app --(1) HTTP request--> Backend API --(2) query--> Database
//   React app <--(4) JSON response-- Backend API <--(3) rows-- Database
//
// JSON is plain text with structured data: objects { }, arrays [ ], strings,
// numbers, true/false, null. The browser turns it into JavaScript with response.json().
// Why a backend in between? The database password stays secret, the backend
// decides who may see what, and many different clients can use the same API.
// In this training the "backend" is a mock API inside vite.config.ts (data in memory).

const REQUEST = "#2563eb";
const RESPONSE = "#ea580c";

function Node({ x, title, lines, w = 200, tint }: { x: number; title: string; lines: string[]; w?: number; tint?: string }) {
  return (
    <g>
      <rect x={x} y="20" width={w} height={tint ? 140 : 120} rx="10" fill={tint ?? "rgba(127,127,127,0.10)"} stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" />
      <text x={x + w / 2} y="48" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">{title}</text>
      {lines.map((line, i) => (
        <text key={line} x={x + w / 2} y={74 + i * 22} textAnchor="middle" fontSize="13" fill="currentColor">{line}</text>
      ))}
    </g>
  );
}

function Step({ x1, x2, y, color, n, id = "" }: { x1: number; x2: number; y: number; color: string; n: number; id?: string }) {
  const head = (color === REQUEST ? "req-head" : "res-head") + id;
  const cx = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2.5" markerEnd={`url(#${head})`} />
      <circle cx={cx} cy={y} r="9" fill={color} />
      <text x={cx} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{n}</text>
    </g>
  );
}

function Diagram() {
  return (
    <svg viewBox="0 0 760 160" width="100%" role="img" aria-label="A React app sends an HTTP request to a backend API, which queries a database. The rows go back to the backend and return to the app as JSON."
      style={{ maxWidth: 760, display: "block", margin: "0 auto" }} fontFamily="system-ui, sans-serif">
      <defs>
        <marker id="req-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={REQUEST} />
        </marker>
        <marker id="res-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={RESPONSE} />
        </marker>
      </defs>
      <Node x={10} title="Client" lines={["React app in the browser", "fetch / useQuery", "shows the data"]} />
      <Node x={280} title="Backend (API)" lines={["route /api/leaves", "checks the request", "builds the JSON"]} />
      <Node x={550} title="Database" lines={["table: leaves", "rows and columns", "stores the data"]} />
      <Step x1={212} x2={278} y={64} color={REQUEST} n={1} />
      <Step x1={278} x2={212} y={106} color={RESPONSE} n={4} />
      <Step x1={482} x2={548} y={64} color={REQUEST} n={2} />
      <Step x1={548} x2={482} y={106} color={RESPONSE} n={3} />
    </svg>
  );
}

function ShopDiagram() {
  const xs = [5, 215, 425, 635];
  const heads = (id: string) => (
    <>
      <marker id={"req-head" + id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill={REQUEST} />
      </marker>
      <marker id={"res-head" + id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill={RESPONSE} />
      </marker>
    </>
  );
  return (
    <svg viewBox="0 0 800 195" width="100%" role="img" aria-label="A shopping app calls REST API endpoints. The API passes the work to the backend business logic, which checks stock and prices and reads or writes the database. JSON travels back the same way."
      style={{ maxWidth: 800, display: "block", margin: "0 auto" }} fontFamily="system-ui, sans-serif">
      <defs>{heads("-shop")}</defs>
      <Node x={xs[0]} w={160} title="Shopping app" lines={["React in the browser", "product list, cart", "calls the API"]} />
      <Node x={xs[1]} w={160} title="API (REST)" lines={["GET /api/products", "POST /api/cart/items", "POST /api/orders", "JSON in and out"]} tint="rgba(37,99,235,0.10)" />
      <Node x={xs[2]} w={160} title="Business logic" lines={["(backend server)", "checks stock", "price and discount", "validates the order"]} tint="rgba(22,163,74,0.12)" />
      <Node x={xs[3]} w={160} title="Database" lines={["products", "carts", "orders, users"]} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Step id="-shop" x1={xs[i] + 162} x2={xs[i + 1] - 2} y={70} color={REQUEST} n={i + 1} />
          <Step id="-shop" x1={xs[i + 1] - 2} x2={xs[i] + 162} y={122} color={RESPONSE} n={6 - i} />
        </g>
      ))}
      <text x={xs[0] + 80} y="182" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">runs on the user's device</text>
      <text x="520" y="182" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">runs on your servers</text>
    </svg>
  );
}

export default function ClientServerApiDatabase() {
  return (
    <div>
      <figure className="demo" style={{ margin: "0 0 16px" }}>
        <Diagram />
      </figure>

      <ol>
        <li><b>Request.</b> The app sends an HTTP request: a method (GET) and a URL (/api/leaves).</li>
        <li><b>Query.</b> The backend checks the request, then asks the database, for example SELECT * FROM leaves.</li>
        <li><b>Rows.</b> The database returns rows. The backend still holds them, nothing reached the browser yet.</li>
        <li><b>Response.</b> The backend turns the rows into JSON and replies with a status code (200 OK).</li>
      </ol>

      <h3>Example: a shopping app</h3>
      <figure className="demo" style={{ margin: "0 0 16px" }}>
        <ShopDiagram />
      </figure>
      <ol>
        <li>The shopper clicks Add to cart. The app sends the request to an API endpoint, for example POST /api/cart/items with the product id.</li>
        <li>The API hands the request to the backend business logic. It is the only place that knows the rules.</li>
        <li>The business logic checks the stock and works out the price and discount. Then it reads or writes the database.</li>
        <li>The database returns the saved rows.</li>
        <li>The business logic builds the answer, such as the updated cart with totals.</li>
        <li>The API sends it back as JSON and the app shows the new cart.</li>
      </ol>
      <p className="note">
        The app never talks to the database, and it never decides prices or stock: the browser can be changed
        by anyone, so the rules live in the backend. A database row becomes a JSON object, a list of rows a JSON array.
      </p>

      <p className="try">
        Try it: open the useQuery topic, then browser DevTools, Network tab, filter by Fetch/XHR.
        Click a request named leaves and compare its Headers and Response tabs with the boxes above.
      </p>
    </div>
  );
}
