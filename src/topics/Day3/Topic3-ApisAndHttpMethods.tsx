// DAY 3 · TOPIC 3: APIs and HTTP methods
//
// API = Application Programming Interface: a set of rules for how one program asks
// another program to do something. Think of a restaurant: you (the React app) read the
// menu (the API), tell the waiter (an HTTP request) what you want, and the kitchen
// (backend + database) does the work. You never walk into the kitchen.
//
// A web API (REST) is made of two things:
//   URL    = WHAT you talk about: /api/products (the list), /api/products/7 (one item)
//   METHOD = WHAT TO DO with it: read, create, replace, change a part, remove
//
// The server answers with a status code (2xx worked, 4xx your request is wrong,
// 5xx the server failed) and usually JSON.
//
// Safe = does not change data. Idempotent = sending it twice gives the same result
// as sending it once. This matters when a network retry sends a request again.
// The mock API in this training supports GET, POST, PATCH and DELETE.

type Row = {
  method: string;
  purpose: string;
  shop: string;
  body: string;
  success: string;
  safe: string;
  idempotent: string;
  color: string;
};

const rows: Row[] = [
  { method: "GET", purpose: "Read data", shop: "GET /api/products or GET /api/products/7", body: "none", success: "200 OK", safe: "yes", idempotent: "yes", color: "#16a34a" },
  { method: "POST", purpose: "Create something new", shop: "POST /api/orders with the cart in the body", body: "the new item", success: "201 Created", safe: "no", idempotent: "no (two posts = two orders)", color: "#2563eb" },
  { method: "PUT", purpose: "Replace the whole item", shop: "PUT /api/products/7 with every field", body: "the complete item", success: "200 OK", safe: "no", idempotent: "yes", color: "#ea580c" },
  { method: "PATCH", purpose: "Change only some fields", shop: "PATCH /api/orders/12 with { status: \"Cancelled\" }", body: "only the changed fields", success: "200 OK", safe: "no", idempotent: "usually", color: "#9333ea" },
  { method: "DELETE", purpose: "Remove an item", shop: "DELETE /api/cart/items/3", body: "none", success: "200 OK or 204 No Content", safe: "no", idempotent: "yes", color: "#dc2626" },
];

function MethodTag({ method, color }: { method: string; color: string }) {
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "monospace" }}>
      {method}
    </span>
  );
}

export default function ApisAndHttpMethods() {
  return (
    <div>
      <div className="demo">
        <h3>What is an API?</h3>
        <ul>
          <li><b>You (React app)</b> read the menu: the list of URLs and methods the backend offers.</li>
          <li><b>The request</b> is your order: a method plus a URL, sometimes a JSON body.</li>
          <li><b>The backend and database</b> are the kitchen: they do the work and hide how.</li>
          <li><b>The response</b> is the dish: a status code and JSON.</li>
        </ul>
      </div>

      <h3>HTTP methods (shopping app examples)</h3>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Purpose</th>
            <th>Example</th>
            <th>Request body</th>
            <th>Success</th>
            <th>Safe</th>
            <th>Same result if repeated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.method}>
              <td><MethodTag method={row.method} color={row.color} /></td>
              <td>{row.purpose}</td>
              <td><code>{row.shop}</code></td>
              <td>{row.body}</td>
              <td>{row.success}</td>
              <td>{row.safe}</td>
              <td>{row.idempotent}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="note">
        PUT vs PATCH: to change only the price of a product, PATCH sends <code>{`{ "price": 499 }`}</code>.
        PUT must send the whole product, and any field you leave out may be erased.
      </p>

      <h3>Common status codes</h3>
      <ul>
        <li><b>200</b> OK, <b>201</b> Created, <b>204</b> No Content: it worked.</li>
        <li><b>400</b> bad input, <b>401</b> not logged in, <b>403</b> not allowed, <b>404</b> not found: your request is the problem.</li>
        <li><b>500</b> server error: the backend failed, not your request.</li>
      </ul>

      <p className="try">
        Try it: open DevTools, Network tab, then use the Create, update and delete topic. For each action find the
        request and note its method, URL, request body and status code. Which row of the table is it?
      </p>
    </div>
  );
}
