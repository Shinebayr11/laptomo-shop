// Wire API-г дуурайсан түр сервер — бодит түлхүүр ашиглахгүйгээр урсгалыг шалгана.
const http = require("http");

const intents = new Map();
let counter = 0;

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  console.log(`[mock-wire] ${req.method} ${path} auth=${req.headers.authorization ? "yes" : "no"} idem=${req.headers["idempotency-key"] || "-"}`);

  // PaymentIntent үүсгэх
  if (req.method === "POST" && path === "/v1/payment_intents") {
    const body = await readBody(req);
    counter += 1;
    const id = `pi_mock_${counter}`;
    const intent = {
      id,
      object: "payment_intent",
      amount: body.amount,
      currency: "MNT",
      status: "requires_confirmation",
      metadata: body.metadata,
      next_action: null,
    };
    intents.set(id, intent);
    return json(res, 200, intent);
  }

  // Баталгаажуулах — банкны холбоос буцаана
  const confirmMatch = path.match(/^\/v1\/payment_intents\/([^/]+)\/confirm$/);
  if (req.method === "POST" && confirmMatch) {
    const intent = intents.get(confirmMatch[1]);
    if (!intent) return json(res, 404, { error: { message: "not found" } });
    const body = await readBody(req);
    intent.status = "requires_action";
    intent.next_action = {
      type: "redirect_to_url",
      redirect_to_url: { url: `http://localhost:3200/pay/${intent.id}?return_url=${encodeURIComponent(body.return_url || "")}` },
    };
    return json(res, 200, intent);
  }

  // Төлөв асуух — гуравдугаар удаад "succeeded" болгож polling-ийг шалгана
  const getMatch = path.match(/^\/v1\/payment_intents\/([^/]+)$/);
  if (req.method === "GET" && getMatch) {
    const intent = intents.get(getMatch[1]);
    if (!intent) return json(res, 404, { error: { message: "no such payment_intent" } });
    intent._polls = (intent._polls || 0) + 1;
    if (intent._polls >= 3) {
      intent.status = "succeeded";
      intent.next_action = null;
    }
    return json(res, 200, intent);
  }

  json(res, 404, { error: { message: "unknown route" } });
});

server.listen(3200, () => console.log("[mock-wire] listening on 3200"));
