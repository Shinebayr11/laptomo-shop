/**
 * supabase/*.sql файлуудыг жинхэнэ Postgres дээр ажиллуулж шалгана.
 * Supabase project огт хэрэггүй — түр Postgres локалд асаж, дуусмагц устана.
 *
 *   npm install --no-save embedded-postgres
 *   node scripts/test-sql.js
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

let EmbeddedPostgres;
try {
  EmbeddedPostgres = require("embedded-postgres").default;
} catch {
  console.error(
    "embedded-postgres суулгаагүй байна. Эхлээд:\n" +
      "  npm install --no-save embedded-postgres\n",
  );
  process.exit(1);
}

const REPO = path.join(__dirname, "..");
const SQL = (name) => fs.readFileSync(path.join(REPO, "supabase", name), "utf8");

let passed = 0;
let failed = 0;
const ok = (name) => (passed++, console.log(`  ✅ ${name}`));
const bad = (name, detail) => (
  failed++, console.log(`  ❌ ${name}\n     ${detail}`)
);

async function expectError(fn, fragment, name) {
  try {
    await fn();
    bad(name, "алдаа гарах ёстой байсан ч амжилттай болов");
  } catch (e) {
    if (fragment && !e.message.includes(fragment)) bad(name, `өөр алдаа: ${e.message}`);
    else ok(`${name} → "${e.message.slice(0, 55)}"`);
  }
}

/** Supabase-ийн өгдөг auth схем, role-уудыг дуурайна. */
const SUPABASE_STUB = `
  create schema if not exists auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create or replace function auth.uid() returns uuid language sql stable as $fn$
    select nullif(current_setting('app.uid', true), '')::uuid;
  $fn$;
  do $r$ begin create role anon; exception when duplicate_object then null; end $r$;
  do $r$ begin create role authenticated; exception when duplicate_object then null; end $r$;
`;

async function withPostgres(port, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "laptomo-pg-"));
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("test");
  const client = pg.getPgClient("test");
  await client.connect();
  try {
    return await fn(client, pg);
  } finally {
    await client.end().catch(() => {});
    await pg.stop().catch(() => {});
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const asUser = (client, uid) =>
  client.query("select set_config('app.uid', $1, false)", [uid]);

const items = (id, qty) =>
  JSON.stringify([{ product_id: id, quantity: qty, title: "x", price: 1, image: "" }]);

async function testStockTracking() {
  console.log("\n━━ stock-tracking.sql ━━");
  await withPostgres(54329, async (client, pg) => {
    await client.query(SUPABASE_STUB);
    await client.query(SQL("schema.sql"));
    ok("schema.sql алдаагүй ажиллав");
    await client.query(SQL("stock-tracking.sql"));
    ok("stock-tracking.sql алдаагүй ажиллав");

    const ADMIN = "11111111-1111-1111-1111-111111111111";
    const BUYER = "22222222-2222-2222-2222-222222222222";
    const BUYER2 = "33333333-3333-3333-3333-333333333333";

    await client.query(
      "insert into auth.users (id, email) values ($1,'admin@x.mn'),($2,'a@x.mn'),($3,'b@x.mn')",
      [ADMIN, BUYER, BUYER2],
    );
    await client.query("update public.profiles set role='admin' where id=$1", [ADMIN]);
    await client.query(`
      insert into public.products (id,title,slug,price,discount_price,category,subcategory,brand,stock)
      values ('p-022','Triple Monitor','triple',1699000,1499000,'triple','triple-14','LS Tech',8),
             ('p-024','Cable','cable',45000,38000,'accessory','cables','LS Tech',3)
    `);

    const place = (id, itemsJson, total) =>
      client.query(
        "select * from public.place_order($1,'Тест','99112233','УБ',$2::jsonb,$3)",
        [id, itemsJson, total],
      );
    const stockOf = async (id) =>
      (await client.query("select stock from public.products where id=$1", [id])).rows[0].stock;

    await asUser(client, BUYER);
    await place("ORD-1", items("p-022", 2), 2998000);
    (await stockOf("p-022")) === 6
      ? ok("нөөц хасагдав (8 → 6)")
      : bad("нөөц хасалт", `stock=${await stockOf("p-022")}`);

    await expectError(
      () => place("ORD-2", items("p-022", 99), 99e6),
      "үлдэгдэл хүрэлцэхгүй",
      "нөөцөөс их захиалахад татгалзав",
    );
    (await stockOf("p-022")) === 6 ? ok("бүтэлгүйтэхэд нөөц хэвээр") : bad("rollback", "нөөц өөрчлөгдөв");
    (await client.query("select count(*)::int c from public.orders where id='ORD-2'")).rows[0].c === 0
      ? ok("бүтэлгүй захиалга DB-д үлдээгүй")
      : bad("rollback", "ORD-2 үүссэн");

    await place("ORD-1", items("p-022", 2), 2998000);
    (await stockOf("p-022")) === 6
      ? ok("идемпотент — давтахад нөөц дахин хасагдсангүй")
      : bad("идемпотент", `stock=${await stockOf("p-022")}`);

    await expectError(
      () => place("ORD-3", items("p-022", 1), 1),
      "дүн буруу",
      "үнэ хуурах оролдлого татгалзагдав",
    );

    await client.query("select set_config('app.uid','',false)");
    await expectError(
      () => place("ORD-4", items("p-022", 1), 1499000),
      "Нэвтрээгүй",
      "нэвтрээгүй үед татгалзав",
    );

    await asUser(client, ADMIN);
    await client.query("select public.set_order_status('ORD-1','cancelled')");
    (await stockOf("p-022")) === 8 ? ok("цуцлахад нөөц буцав (6 → 8)") : bad("цуцлалт", "буцаагүй");

    await client.query("select public.set_order_status('ORD-1','processing')");
    (await stockOf("p-022")) === 6 ? ok("сэргээхэд дахин хасагдав (8 → 6)") : bad("сэргээлт", "хасагдаагүй");

    await asUser(client, BUYER);
    await expectError(
      () => client.query("select public.set_order_status('ORD-1','delivered')"),
      "Зөвхөн админ",
      "админ бус хүн татгалзагдав",
    );

    // Зэрэгцээ хоёр захиалга — oversell гарах ёсгүй
    const c2 = pg.getPgClient("test");
    await c2.connect();
    await client.query("begin");
    await c2.query("begin");
    await client.query("select set_config('app.uid',$1,true)", [BUYER]);
    await c2.query("select set_config('app.uid',$1,true)", [BUYER2]);
    await client.query(
      "select public.place_order('ORD-A','A','99112233','УБ',$1::jsonb,76000)",
      [items("p-024", 2)],
    );
    const racer = c2
      .query("select public.place_order('ORD-B','B','99112233','УБ',$1::jsonb,76000)", [
        items("p-024", 2),
      ])
      .then(() => null)
      .catch((e) => e.message);
    await client.query("commit");
    const racerError = await racer;
    await c2.query("commit").catch(() => {});
    await c2.end();

    const left = await stockOf("p-024");
    racerError && left === 1
      ? (ok(`зэрэгцээ захиалгын хоёр дахь нь татгалзав → "${racerError.slice(0, 45)}"`),
        ok("oversell гараагүй (нөөц 3 → 1)"))
      : bad("зэрэгцээ захиалга", `хоёр дахь=${racerError} нөөц=${left}`);

    await asUser(client, BUYER);
    await place("ORD-5", items("p-999", 1), 500000);
    (await client.query("select count(*)::int c from public.orders where id='ORD-5'")).rows[0].c === 1
      ? ok("DB-д мөргүй бараа нөөц хянахгүйгээр захиалагдав")
      : bad("seed-only бараа", "захиалга үүсээгүй");
  });
}

async function testProductSync() {
  console.log("\n━━ sync-missing-products.sql ━━");
  await withPostgres(54330, async (client) => {
    await client.query(SUPABASE_STUB);
    await client.query(SQL("schema.sql"));
    const sync = SQL("sync-missing-products.sql");

    await client.query(sync);
    const count = async () =>
      (await client.query("select count(*)::int c from public.products")).rows[0].c;
    (await count()) === 6 ? ok("6 бараа орлоо") : bad("оруулалт", `${await count()} мөр`);

    await client.query(sync);
    (await count()) === 6 ? ok("дахин ажиллуулахад давхардсангүй") : bad("давхардал", `${await count()} мөр`);

    await client.query("update public.products set is_archived=true, stock=99 where id='p-022'");
    await client.query(sync);
    const row = (
      await client.query("select is_archived, stock from public.products where id='p-022'")
    ).rows[0];
    row.is_archived === true && row.stock === 99
      ? ok("одоо байгаа мөрийн архив/нөөц хөндөгдсөнгүй")
      : bad("одоо байгаа мөр", JSON.stringify(row));

    const sample = (
      await client.query(
        "select title, jsonb_array_length(images) i, jsonb_array_length(specifications) s from public.products where id='p-023'",
      )
    ).rows[0];
    sample.i > 0 && sample.s > 0
      ? ok(`бичвэр/JSON зөв хадгалагдав (${sample.title})`)
      : bad("JSON", JSON.stringify(sample));
  });
}

(async () => {
  try {
    await testStockTracking();
    await testProductSync();
  } catch (e) {
    console.log(`\n💥 ГЭНЭТИЙН АЛДАА: ${e.message}`);
    failed += 1;
  }
  console.log(`\n${"═".repeat(46)}\nТэнцсэн: ${passed}   Унасан: ${failed}`);
  process.exit(failed ? 1 : 0);
})();
