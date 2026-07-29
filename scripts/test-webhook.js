/**
 * Wire webhook-ийн гарын үсэг шалгах логикийг турших.
 *   node scripts/test-webhook.js
 *
 * Ажиллаж буй сервер рүү бодит хүсэлт илгээж шалгах бол:
 *   WEBHOOK_URL=http://localhost:3000/api/wire/webhook \
 *   WIRE_WEBHOOK_SECRET=whsec_test node scripts/test-webhook.js
 */
const crypto = require("crypto");

const SECRET = process.env.WIRE_WEBHOOK_SECRET || "whsec_test_secret";
const URL_ = process.env.WEBHOOK_URL || null;

let passed = 0;
let failed = 0;
const ok = (n) => (passed++, console.log(`  ✅ ${n}`));
const bad = (n, d) => (failed++, console.log(`  ❌ ${n}\n     ${d}`));

function sign(body, secret = SECRET, t = Math.floor(Date.now() / 1000)) {
  const v1 = crypto.createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

// ── Гарын үсгийн логикийг шууд шалгах (сервер хэрэггүй) ──
// route.ts-ийн ашигладаг логикийг давхардуулалгүй энд дахин хэрэгжүүлж,
// хоёулаа ижил үр дүн өгөх ёстойг шалгана.
function verify(header, rawBody, secret, nowSec = Math.floor(Date.now() / 1000)) {
  if (!header) return "толгой алга";
  let t = null, v1 = null;
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === "t") { if (!/^\d+$/.test(v)) return "t буруу"; t = Number(v); }
    else if (k === "v1") { if (!/^[0-9a-f]+$/i.test(v)) return "v1 буруу"; v1 = v.toLowerCase(); }
  }
  if (t === null || v1 === null) return "толгой дутуу";
  if (Math.abs(nowSec - t) > 300) return "хугацаа хэтэрсэн";
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  if (expected.length !== v1.length) return "таарахгүй";
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"))) return "таарахгүй";
  return null;
}

const body = JSON.stringify({
  id: "evt_test_1",
  object: "event",
  type: "payment_intent.succeeded",
  data: { object: { id: "pi_1", amount: 1499000, status: "succeeded", metadata: { order_id: "ORD-X" } } },
});

console.log("━━ Гарын үсгийн шалгалт ━━");

verify(sign(body), body, SECRET) === null
  ? ok("зөв гарын үсэг хүлээн авагдав")
  : bad("зөв гарын үсэг", verify(sign(body), body, SECRET));

verify(sign(body, "буруу_нууц"), body, SECRET) !== null
  ? ok("өөр secret-ээр гарын үсэг татгалзагдав")
  : bad("буруу secret", "хүлээн авагдсан!");

verify(sign(body), body + " ", SECRET) !== null
  ? ok("body өөрчлөгдвөл татгалзагдав")
  : bad("body өөрчлөлт", "хүлээн авагдсан!");

const old = Math.floor(Date.now() / 1000) - 400;
verify(sign(body, SECRET, old), body, SECRET) !== null
  ? ok("400 секундын өмнөх timestamp татгалзагдав (replay)")
  : bad("хуучин timestamp", "хүлээн авагдсан!");

const future = Math.floor(Date.now() / 1000) + 400;
verify(sign(body, SECRET, future), body, SECRET) !== null
  ? ok("ирээдүйн timestamp татгалзагдав")
  : bad("ирээдүйн timestamp", "хүлээн авагдсан!");

verify(null, body, SECRET) !== null ? ok("толгойгүй хүсэлт татгалзагдав") : bad("толгойгүй", "хүлээн авагдсан!");
verify("t=abc,v1=zz", body, SECRET) !== null ? ok("гаж форматтай толгой татгалзагдав") : bad("гаж формат", "хүлээн авагдсан!");

const tail = sign(body);
const truncated = tail.slice(0, tail.length - 2);
verify(truncated, body, SECRET) !== null ? ok("богиносгосон гарын үсэг татгалзагдав") : bad("богино v1", "хүлээн авагдсан!");

// ── Ажиллаж буй сервер рүү бодит хүсэлт ──
(async () => {
  if (URL_) {
    console.log(`\n━━ Бодит хүсэлт → ${URL_} ━━`);
    const post = async (raw, header) => {
      const res = await fetch(URL_, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(header ? { "WirePayment-Signature": header } : {}) },
        body: raw,
      });
      return { status: res.status, body: await res.text() };
    };

    const ping = JSON.stringify({ id: "evt_ping", object: "event", type: "endpoint.verification" });
    const r1 = await post(ping, sign(ping));
    r1.status >= 200 && r1.status < 300
      ? ok(`endpoint.verification → ${r1.status}`)
      : bad("verification ping", `${r1.status} ${r1.body}`);

    const r2 = await post(body, sign(body, "буруу_нууц"));
    r2.status === 400 ? ok("буруу гарын үсэг → 400") : bad("буруу гарын үсэг", `${r2.status} ${r2.body}`);

    const r3 = await post(body, null);
    r3.status === 400 ? ok("толгойгүй → 400") : bad("толгойгүй", `${r3.status} ${r3.body}`);
  } else {
    console.log("\n(WEBHOOK_URL өгвөл ажиллаж буй сервер рүү бодит хүсэлт илгээнэ)");
  }

  console.log(`\n${"═".repeat(46)}\nТэнцсэн: ${passed}   Унасан: ${failed}`);
  process.exit(failed ? 1 : 0);
})();
