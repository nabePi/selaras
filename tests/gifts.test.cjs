/* eslint-disable @typescript-eslint/no-require-imports -- Isolated server tests load TS after installing database/session mocks. */
const { test, beforeEach, afterEach, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const { registerHooks } = require("node:module");
const { randomUUID } = require("node:crypto");
const { existsSync, readFileSync, statSync } = require("node:fs");
const { resolve } = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const ts = require("typescript");
const root = resolve(__dirname, "..");
let setting, records, journalQueries, profileQueries;
const fixtureJournals = new Map();
const key = (v) => `${v.userId}:${v.settingVersion}:${v.periodStart.toISOString()}`;
const matches = (r, w) => Object.entries(w || {}).every(([k, v]) => v && typeof v === "object" && "gt" in v ? r[k] > v.gt : r[k] === v);
global.__giftDb = {
  giftSetting: {
    findUnique: async () => setting ? { ...setting } : null,
    findUniqueOrThrow: async () => { if (!setting) throw new Error("Missing setting"); return { ...setting }; },
    upsert: async () => setting || (setting = { id: 1, enabled: false, enabledAt: null, version: 0 }),
    updateMany: async ({ where, data }) => {
      if (!setting || !matches(setting, where)) return { count: 0 };
      setting = { ...setting, ...data, version: data.version ? setting.version + data.version.increment : setting.version };
      return { count: 1 };
    },
  },
  memberGift: {
    findUnique: async ({ where }) => records.get(key(where.userId_settingVersion_periodStart)) || null,
    findMany: async ({ where, take }) => [...records.values()].filter((r) => r.userId === where.userId).sort((a, b) => b.createdAt - a.createdAt).slice(0, take),
    upsert: async ({ create }) => {
      const k = key(create);
      if (!records.has(k)) records.set(k, { id: randomUUID(), feedback: null, ...create, createdAt: new Date() });
      return records.get(k);
    },
    updateMany: async ({ where, data }) => { const r = [...records.values()].find((r) => matches(r, where)); if (!r) return { count: 0 }; Object.assign(r, data); return { count: 1 }; },
    count: async ({ where } = {}) => [...records.values()].filter((r) => matches(r, where)).length,
  },
  user: { findUnique: async (query) => { profileQueries.push(query); return { activities: "Merawat keluarga dan bekerja", skills: ["menulis"], maritalStatus: "MENIKAH" }; } },
  promptResponse: { findMany: async (query) => { journalQueries.push(query); return (fixtureJournals.get(query.where.userId) || []).filter((j) => j.date <= query.where.date.lte).sort((a, b) => b.date - a.date).slice(0, query.take); } },
  $transaction: async (fn) => fn(global.__giftDb),
};
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const base = specifier.startsWith("@/") ? resolve(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href) ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (base) { const file = [base, `${base}.ts`, `${base}.tsx`].find((p) => existsSync(p) && statSync(p).isFile()); if (file) return { url: pathToFileURL(file).href, shortCircuit: true }; }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.includes("/node_modules/server-only/")) return { format: "commonjs", source: "", shortCircuit: true };
    if (url === pathToFileURL(resolve(root, "src/lib/db.ts")).href) return { format: "commonjs", source: "module.exports = {db:global.__giftDb}", shortCircuit: true };
    if (url === pathToFileURL(resolve(root, "src/lib/server/session.ts")).href) return {
      format: "commonjs", shortCircuit: true,
      source: `const {ApiError}=require('@/lib/server/errors');module.exports={
        requireMemberApi:async()=>{if(!global.__giftMember)throw new ApiError(401,'Login');return global.__giftMember},
        requireAdminApi:async()=>{if(!global.__giftAdmin)throw new ApiError(403,'Admin only');return global.__giftAdmin}
      }`,
    };
    if (url.startsWith(pathToFileURL(resolve(root, "src")).href) && /\.tsx?$/.test(url)) return {
      format: "commonjs", shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), { fileName: fileURLToPath(url), compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText,
    };
    return next(url, context);
  },
});
const { giftPeriod } = require("../src/lib/gift-period.ts");
const { GIFT_CONTENT, giftShareText } = require("../src/data/gifts.ts");
const { openGift, currentGift, giftFeedback } = require("../src/server/member/gift.ts");
const { setGiftEnabled, giftAdminOverview } = require("../src/server/admin/gift.ts");
const { generateGift, giftAiConfig } = require("../src/lib/server/gift-ai.ts");
const { HomeGift } = require("../src/components/home-gift.tsx");
const routes = require("../src/app/api/gift/route.ts");
const feedbackRoute = require("../src/app/api/gift/[id]/feedback/route.ts");
const adminRoute = require("../src/app/api/admin/gift/route.ts");
const originalFetch = global.fetch;
const originalWarn = console.warn;
const envNames = ["GIFT_AI_PROVIDER", "GIFT_DEEPSEEK_MODEL", "GIFT_OPENAI_MODEL", "OPENAI_API_KEY", "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"];
const originalEnv = Object.fromEntries(envNames.map((k) => [k, process.env[k]]));
const intro = "Ada hari ketika tanggung jawab terasa begitu penuh. Semoga hadiah ini memberimu ruang bernapas dan mengingat bahwa kamu boleh menjalani semuanya selangkah demi selangkah, dengan lembut pada dirimu sendiri.";
const selection = (id = "quran-tenang", prayer = null) => ({ contentId: id, intro, personalPrayer: prayer });
const deepseek = (value = selection()) => Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }] });
const providerMock = async (_url, options) => {
  const data = JSON.parse(options.body);
  const input = JSON.parse(data.messages[1].content);
  return deepseek(selection(input.koleksi[0].id));
};

beforeEach(() => {
  setting = null; records = new Map(); journalQueries = []; profileQueries = []; fixtureJournals.clear();
  delete global.__giftMember; delete global.__giftAdmin;
  for (const k of envNames) delete process.env[k];
  console.warn = () => {};
  global.fetch = providerMock;
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-16T05:00:00Z") });
});
afterEach(() => { global.fetch = originalFetch; console.warn = originalWarn; mock.timers.reset(); });
after(() => { hooks.deregister(); delete global.__giftDb; for (const [k, v] of Object.entries(originalEnv)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } });

test("default is off: no journal/profile access, provider calls or gift persistence", async () => {
  let calls = 0; global.fetch = async () => { calls++; return deepseek(); };
  await assert.rejects(openGift(1), { status: 403 });
  await assert.rejects(currentGift(1), { status: 403 });
  assert.equal(calls, 0); assert.equal(records.size, 0); assert.equal(journalQueries.length, 0); assert.equal(profileQueries.length, 0);
});

test("enable is idempotent; disabling and re-enabling starts a new activation", async () => {
  await setGiftEnabled(true); const version = setting.version; const start = setting.enabledAt.getTime();
  await setGiftEnabled(true); assert.equal(setting.version, version); assert.equal(setting.enabledAt.getTime(), start);
  await setGiftEnabled(false); assert.equal(setting.enabled, false);
  mock.timers.tick(1000); await setGiftEnabled(true); assert.ok(setting.version > version); assert.ok(setting.enabledAt.getTime() > start);
});

test("periods change after three WIB dates, including month/year boundaries", () => {
  const anchor = new Date("2026-12-30T15:00:00Z");
  const first = giftPeriod(anchor, new Date("2027-01-01T16:59:59Z"));
  assert.equal(first.start.toISOString(), "2026-12-30T00:00:00.000Z");
  assert.equal(first.expiresAt.toISOString(), "2027-01-01T17:00:00.000Z");
  const next = giftPeriod(anchor, new Date("2027-01-01T17:00:00Z"));
  assert.equal(next.start.toISOString(), "2027-01-02T00:00:00.000Z");
});

test("active fallback is persisted without keys; Home reads never generate or access journals", async () => {
  await setGiftEnabled(true); let calls = 0; global.fetch = async () => { calls++; return deepseek(); };
  assert.equal(await currentGift(2), null);
  const first = await openGift(2); assert.ok(first.id); assert.equal(first.personalPrayer, null);
  assert.equal((await openGift(2)).id, first.id); assert.equal((await currentGift(2)).id, first.id);
  assert.equal(calls, 0); assert.equal(journalQueries.length, 0); assert.equal(records.size, 1);
});

test("Home card is hidden by default and activation never generates a gift on Home", async () => {
  assert.equal(await HomeGift({ userId: 22 }), null);
  await setGiftEnabled(true);
  const card = await HomeGift({ userId: 22 });
  assert.ok(card); assert.equal(card.props.children.props.href, "/gift");
  assert.equal(records.size, 0); assert.equal(journalQueries.length, 0);
  await setGiftEnabled(false); assert.equal(await HomeGift({ userId: 22 }), null);
});

test("DeepSeek sees only owner profile and latest five journals through today, not identity or attachments", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(3, Array.from({ length: 8 }, (_, i) => ({ date: new Date(`2026-10-${String(18 - i).padStart(2, "0")}T00:00:00Z`), content: `catatan ${i}`, answers: [{ value: "Lelah", question: { label: "Perasaanmu?" } }] })));
  let payload;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.cache, "no-store");
    const body = JSON.parse(options.body); assert.equal(body.model, "deepseek-flash");
    payload = JSON.parse(body.messages[1].content).kondisi;
    return deepseek();
  };
  const gift = await openGift(3); assert.equal(gift.content.id, "quran-tenang"); assert.equal(gift.intro, intro);
  assert.equal(payload.jurnal.length, 5); assert.equal(payload.jurnal[0].tanggal, "2026-10-16");
  assert.deepEqual(Object.keys(payload.profil).sort(), ["activities", "maritalStatus", "skills"]);
  assert.equal(journalQueries[0].where.userId, 3); assert.equal(journalQueries[0].take, 5); assert.equal(journalQueries[0].select.attachments, undefined);
  assert.equal(profileQueries[0].select.name, undefined); assert.equal(profileQueries[0].select.email, undefined);
});

test("zero or fewer than three journals still works; refresh/concurrency use one generated gift", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key"; let calls = 0;
  global.fetch = async (...args) => { calls++; await new Promise((r) => setTimeout(r, 5)); return providerMock(...args); };
  const results = await Promise.all(Array.from({ length: 5 }, () => openGift(4)));
  assert.equal(calls, 1); assert.equal(new Set(results.map((r) => r.id)).size, 1);
  const again = await openGift(4); assert.equal(again.id, results[0].id); assert.equal(calls, 1);
  fixtureJournals.set(5, [{ date: new Date("2026-10-15"), content: "Tulisan pendek", answers: [] }]);
  assert.ok((await openGift(5)).id);
});

test("next period changes gift and avoids the previous content, even without provider", async () => {
  await setGiftEnabled(true); const first = await openGift(6);
  mock.timers.tick(3 * 86_400_000);
  const next = await openGift(6); assert.notEqual(next.id, first.id); assert.notEqual(next.content.id, first.content.id);
  assert.equal(records.size, 2);
});

test("disable while AI is in flight prevents saving and stops subsequent generation", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  let release, reached;
  const started = new Promise((r) => { reached = r; });
  global.fetch = async () => { reached(); return new Promise((r) => { release = () => r(deepseek()); }); };
  const opening = openGift(7); await started; await setGiftEnabled(false); release();
  await assert.rejects(opening, { status: 403 }); assert.equal(records.size, 0);
  const count = journalQueries.length; await assert.rejects(openGift(7), { status: 403 }); assert.equal(journalQueries.length, count);
});

test("AI cannot invent reference IDs, rewrite source fields or attach personal prayer to non-dua", async () => {
  process.env.DEEPSEEK_API_KEY = "fake-key";
  const invalid = [selection("made-up-verse"), { ...selection(), arabic: "invented verse" }, selection("quran-tenang", { arabic: "اللهم", latin: "Allahumma", meaning: "Ya Allah" })];
  for (const value of invalid) { global.fetch = async () => deepseek(value); await assert.rejects(generateGift({}, GIFT_CONTENT)); }
  const prayer = { arabic: "اللَّهُمَّ ارْزُقْنِي قَلْبًا مُطْمَئِنًّا", latin: "Allāhumma-rzuqnī qalban muṭma’innā.", meaning: "Ya Allah, anugerahkanlah kepadaku hati yang tenteram." };
  global.fetch = async () => deepseek(selection("dua-lapang", prayer));
  const result = await generateGift({}, GIFT_CONTENT); assert.deepEqual(result.personalPrayer, prayer);
});

test("OpenAI uses Responses/strict schema/store:false and does not alter quote DeepSeek settings", async () => {
  process.env.GIFT_AI_PROVIDER = "openai"; process.env.OPENAI_API_KEY = "openai-test"; process.env.DEEPSEEK_MODEL = "quote-model-unchanged";
  assert.equal(giftAiConfig().model, "gpt-4.1-mini");
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(options.body); assert.equal(body.store, false); assert.equal(body.text.format.strict, true); assert.equal(body.text.format.type, "json_schema");
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(selection()) }] }] });
  };
  assert.equal((await generateGift({}, GIFT_CONTENT)).provider, "openai");
  assert.equal(process.env.DEEPSEEK_MODEL, "quote-model-unchanged");
});

test("provider failures/malformed output safely produce a sourced fallback", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  for (const [user, response] of [[8, () => new Response("do not expose this", { status: 500 })], [9, () => deepseek({ contentId: "fake" })], [10, () => { throw new DOMException("Timed out", "TimeoutError"); }]]) {
    global.fetch = async () => response(); const gift = await openGift(user); assert.ok(GIFT_CONTENT.some((c) => c.id === gift.content.id)); assert.equal(gift.personalPrayer, null);
  }
});

test("survey votes are owner-scoped, changeable, clearable, expire and aggregate once", async () => {
  await setGiftEnabled(true); const gift = await openGift(11);
  await assert.rejects(giftFeedback(12, gift.id, "LIKE"), { status: 404 });
  await giftFeedback(11, gift.id, "LIKE"); assert.equal((await giftAdminOverview()).likes, 1);
  await giftFeedback(11, gift.id, "DISLIKE"); const stats = await giftAdminOverview(); assert.equal(stats.likes, 0); assert.equal(stats.dislikes, 1);
  await giftFeedback(11, gift.id, null); assert.equal((await giftAdminOverview()).dislikes, 0);
  mock.timers.tick(3 * 86_400_000); await assert.rejects(giftFeedback(11, gift.id, "LIKE"), { status: 404 });
});

test("API auth, CSRF, admin role and vote validation are enforced", async () => {
  const ctx = { params: Promise.resolve({}) };
  assert.equal((await routes.POST(new Request("http://localhost/api/gift", { method: "POST" }), ctx)).status, 401);
  const patch = (body, origin = "http://localhost") => new Request("http://localhost/api/admin/gift", { method: "PATCH", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
  assert.equal((await adminRoute.PATCH(patch({ enabled: true }), ctx)).status, 403);
  global.__giftAdmin = { id: 99 };
  assert.equal((await adminRoute.PATCH(patch({ enabled: true }, "https://evil.example"), ctx)).status, 403);
  assert.equal((await adminRoute.PATCH(patch({ enabled: true }), ctx)).status, 200);
  global.__giftMember = { id: 13 };
  const response = await routes.POST(new Request("http://localhost/api/gift", { method: "POST" }), ctx); assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
  const gift = (await response.json()).data;
  const invalid = new Request(`http://localhost/api/gift/${gift.id}/feedback`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vote: "OTHER" }) });
  assert.equal((await feedbackRoute.PATCH(invalid, { params: Promise.resolve({ id: gift.id }) })).status, 400);
});

test("all four gift types are complete, references are fixed, and sharing excludes personal intro", async () => {
  assert.equal(new Set(GIFT_CONTENT.map((c) => c.kind)).size, 4); assert.equal(new Set(GIFT_CONTENT.map((c) => c.id)).size, GIFT_CONTENT.length);
  for (const c of GIFT_CONTENT) {
    assert.ok(/^https:\/\/(quran.com|sunnah.com)\//.test(c.source.url));
    if (c.kind === "story") assert.ok(c.paragraphs.length >= 2); else assert.ok(c.arabic && c.latin && c.meaning);
  }
  await setGiftEnabled(true); const gift = await openGift(14); const text = giftShareText(gift);
  assert.ok(text.includes(gift.content.title)); assert.ok(text.includes(gift.content.source.url)); assert.ok(!text.includes(gift.intro)); assert.ok(!text.includes(gift.id));
});
