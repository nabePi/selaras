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
const matches = (r, w) => Object.entries(w || {}).every(([k, v]) => v && typeof v === "object" && "gt" in v ? r[k] > v.gt : v && typeof v === "object" && "in" in v ? v.in.includes(r[k]) : r[k] === v);
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
      if (!records.has(k)) records.set(k, { id: randomUUID(), feedback: null, ...create, composition: create.composition ? JSON.parse(JSON.stringify(create.composition)) : null, createdAt: new Date() });
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
const { journalPatterns, rankGiftCandidates, fallbackGift } = require("../src/lib/server/gift-personalization.ts");
const { TANZIL_GIFT_VERSES } = require("../src/data/tanzil-gift-verses.ts");
const { GiftBody } = require("../src/components/gift-reader.tsx");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const { HomeGift } = require("../src/components/home-gift.tsx");
const routes = require("../src/app/api/gift/route.ts");
const feedbackRoute = require("../src/app/api/gift/[id]/feedback/route.ts");
const adminRoute = require("../src/app/api/admin/gift/route.ts");
const originalFetch = global.fetch;
const originalWarn = console.warn;
const envNames = ["GIFT_AI_PROVIDER", "GIFT_DEEPSEEK_MODEL", "GIFT_OPENAI_MODEL", "OPENAI_API_KEY", "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"];
const originalEnv = Object.fromEntries(envNames.map((k) => [k, process.env[k]]));
const intro = "Ada hari ketika tanggung jawab terasa begitu penuh. Semoga hadiah ini memberimu ruang bernapas dan mengingat bahwa kamu boleh menjalani semuanya selangkah demi selangkah, dengan lembut pada dirimu sendiri.";
const journal = (content = "Aku lelah menjalani tanggung jawab.", date = "2026-10-16", id = 1, answers = []) => ({ id, date: new Date(`${date}T00:00:00Z`), content, answers });
const aiContext = { profil: null, jurnal: [{ id: 1, tanggal: "2026-10-16", isi: "Aku lelah.", signals: "Aku lelah." }] };
const selection = (id = "quran-tenang", prayer = null, dates = ["2026-10-16"]) => ({
  contentId: id, personalTitle: "Ruang bernapas untuk dirimu", intro,
  reflection: "Apa yang bisa kamu buat lebih ringan dalam tanggung jawabmu hari ini?",
  smallStep: "Jika memungkinkan, pilih satu tugas yang bisa kamu bagi dengan orang tepercaya.",
  basedOnDates: dates, personalPrayer: prayer,
  composition: {
    paragraphs: [
      "Bacaan ini mengingatkan bahwa memberi ruang bagi diri sendiri dapat berjalan bersama usaha yang sedang kamu jalani. Kamu boleh menghargai langkah kecil tanpa menunggu semua urusan selesai.",
      "Saat beberapa hari terasa penuh, pertimbangkan hal yang benar-benar perlu dijaga dan hal yang masih bisa dibuat lebih sederhana. Mintalah dukungan bila itu memungkinkan bagimu.",
    ],
    closing: "Semoga ada ruang bernapas dan harapan yang menemanimu melangkah hari ini.",
    sourceIds: [id],
  },
});
const deepseek = (value = selection()) => Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }] });
const providerMock = async (_url, options) => {
  const data = JSON.parse(options.body);
  const input = JSON.parse(data.messages[1].content);
  return deepseek(selection(input.koleksi[0].id, null, input.kondisi.jurnal.map((j) => j.tanggal)));
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
  assert.equal(calls, 0); assert.equal(journalQueries.length, 1); assert.equal(records.size, 1);
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
  fixtureJournals.set(3, Array.from({ length: 8 }, (_, i) => ({ id: i + 1, date: new Date(`2026-10-${String(18 - i).padStart(2, "0")}T00:00:00Z`), content: `catatan ${i}`, answers: [{ value: "Lelah", question: { label: "Perasaanmu?" } }] })));
  let payload;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.cache, "no-store");
    const body = JSON.parse(options.body); assert.equal(body.model, "deepseek-flash");
    payload = JSON.parse(body.messages[1].content).kondisi;
    return deepseek(selection("quran-tenang", null, payload.jurnal.map((j) => j.tanggal)));
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
  fixtureJournals.set(4, [journal()]);
  const results = await Promise.all(Array.from({ length: 5 }, () => openGift(4)));
  assert.equal(calls, 1); assert.equal(new Set(results.map((r) => r.id)).size, 1);
  const again = await openGift(4); assert.equal(again.id, results[0].id); assert.equal(calls, 1);
  fixtureJournals.set(5, [journal("Tulisan pendek", "2026-10-15")]);
  assert.ok((await openGift(5)).id);
  assert.ok((await openGift(55)).id);
  assert.equal(calls, 2); // No model call when there is no journal to ground it.
});

test("next period changes gift and avoids the previous content, even without provider", async () => {
  await setGiftEnabled(true); const first = await openGift(6);
  mock.timers.tick(3 * 86_400_000);
  const next = await openGift(6); assert.notEqual(next.id, first.id); assert.notEqual(next.content.id, first.content.id);
  assert.equal(records.size, 2);
});

test("disable while AI is in flight prevents saving and stops subsequent generation", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(7, [journal()]);
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
  for (const value of invalid) { global.fetch = async () => deepseek(value); await assert.rejects(generateGift(aiContext, GIFT_CONTENT)); }
  const prayer = { arabic: "اللَّهُمَّ ارْزُقْنِي قَلْبًا مُطْمَئِنًّا", latin: "Allāhumma-rzuqnī qalban muṭma’innā.", meaning: "Ya Allah, anugerahkanlah kepadaku hati yang tenteram." };
  global.fetch = async () => deepseek(selection("dua-lapang", prayer));
  const result = await generateGift(aiContext, GIFT_CONTENT); assert.deepEqual(result.personalPrayer, prayer);
});

test("OpenAI uses Responses/strict schema/store:false and does not alter quote DeepSeek settings", async () => {
  process.env.GIFT_AI_PROVIDER = "openai"; process.env.OPENAI_API_KEY = "openai-test"; process.env.DEEPSEEK_MODEL = "quote-model-unchanged";
  assert.equal(giftAiConfig().model, "gpt-4.1-mini");
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(options.body); assert.equal(body.store, false); assert.equal(body.text.format.strict, true); assert.equal(body.text.format.type, "json_schema");
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(selection()) }] }] });
  };
  assert.equal((await generateGift(aiContext, GIFT_CONTENT)).provider, "openai");
  assert.equal(process.env.DEEPSEEK_MODEL, "quote-model-unchanged");
});

test("provider failures/malformed output safely produce a sourced fallback", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  for (const [user, response] of [[8, () => new Response("do not expose this", { status: 500 })], [9, () => deepseek({ contentId: "fake" })], [10, () => { throw new DOMException("Timed out", "TimeoutError"); }]]) {
    fixtureJournals.set(user, [journal()]);
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

test("different journal patterns produce relevant fallback gifts, titles and reflections without AI", async () => {
  await setGiftEnabled(true);
  const cases = [
    [30, "Aku lelah dan kewalahan. Aku perlu istirahat.", "lelah"],
    [31, "Aku berduka setelah kehilangan orang terdekat.", "duka"],
    [32, "Aku cemas dan khawatir menghadapi ketidakpastian.", "cemas"],
    [33, "Aku bersyukur, senang dan lega dengan hari ini.", "syukur"],
  ];
  const gifts = [];
  for (const [user, text, theme] of cases) {
    fixtureJournals.set(user, [journal(text), journal(text, "2026-10-15", 2), journal(text, "2026-10-14", 3)]);
    const gift = await openGift(user);
    gifts.push(gift);
    const saved = [...records.values()].find((r) => r.userId === user);
    assert.equal(saved.aiProvider, "theme-fallback");
    assert.equal(saved.personalization.patterns[0].theme, theme);
    assert.equal(saved.personalization.patterns[0].dates.length, 3);
    assert.deepEqual(saved.personalization.journalIds, [1, 2, 3]);
    assert.equal(saved.personalization.contextHash.length, 64);
    assert.ok(!JSON.stringify(saved.personalization).includes(text));
    assert.ok(gift.personalTitle && gift.reflection && gift.smallStep);
    assert.ok(!JSON.stringify(gift).includes("personalization"));
  }
  assert.equal(new Set(gifts.map((g) => g.content.id)).size, 4);
  assert.equal(new Set(gifts.map((g) => g.intro)).size, 4);
  assert.equal(new Set(gifts.map((g) => g.personalTitle)).size, 4);
  assert.equal(new Set(gifts.map((g) => g.reflection)).size, 4);
});

test("fallback matches participant answers, not alarming question labels or profile assumptions", async () => {
  await setGiftEnabled(true);
  fixtureJournals.set(34, [journal("", "2026-10-16", 1, [{ value: "Bersyukur dan bahagia", question: { label: "Apa kamu cemas, lelah, atau takut?" } }])]);
  const gift = await openGift(34);
  assert.match(gift.personalTitle, /baik/);
  assert.equal([...records.values()][0].personalization.patterns[0].theme, "syukur");
  fixtureJournals.set(35, [journal("Aku tidak cemas lagi. Sekarang aku bersyukur dan tenang."), journal("Aku cemas dan takut", "2026-10-15", 2), journal("Aku khawatir", "2026-10-14", 3)]);
  await openGift(35);
  const patterns = [...records.values()].find((r) => r.userId === 35).personalization.patterns;
  assert.equal(patterns[0].theme, "syukur");
  assert.ok(!patterns.some((p) => p.theme === "cemas"));
});

test("recurrence across journals informs the fallback even if the newest entry has no keywords", async () => {
  await setGiftEnabled(true);
  fixtureJournals.set(36, [journal("Aku menuliskan cerita hari ini."), journal("Aku kewalahan dan lelah", "2026-10-15", 2), journal("Aku capek", "2026-10-14", 3)]);
  const gift = await openGift(36);
  assert.match(gift.personalTitle, /Jeda/);
  assert.deepEqual([...records.values()][0].personalization.patterns[0].dates, ["2026-10-15", "2026-10-14"]);
  assert.ok(gift.content.themes.some((t) => ["lelah", "beban", "istirahat", "keseimbangan", "tanggung jawab"].includes(t)));
});

test("neutral fallback does not claim journal knowledge when entries are missing or empty", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(37, [journal(" ", "2026-10-16", 1, [{ value: "", question: { label: "Duka" } }])]);
  global.fetch = () => { throw new Error("No provider call without actual journal content"); };
  const gift = await openGift(37);
  const stored = [...records.values()][0];
  assert.equal(stored.aiProvider, "neutral-fallback");
  assert.deepEqual(stored.personalization.journalIds, []);
  assert.deepEqual(stored.personalization.patterns, []);
  assert.equal(stored.personalization.fallbackReason, "no-journals");
  assert.ok(!/ceritamu|jurnalmu|keluargamu|pasanganmu/.test(gift.intro));
});

test("new and edited journals cannot change an opened gift during its three-day period", async () => {
  await setGiftEnabled(true);
  fixtureJournals.set(38, [journal("Aku lelah dan kewalahan")]);
  const first = await openGift(38);
  const queries = journalQueries.length;
  fixtureJournals.set(38, [journal("Aku bersyukur dan senang", "2026-10-16", 2)]);
  assert.deepEqual(await openGift(38), first);
  assert.deepEqual(await currentGift(38), first);
  assert.equal(journalQueries.length, queries);
  mock.timers.tick(3 * 86_400_000);
  const next = await openGift(38);
  assert.notEqual(next.personalTitle, first.personalTitle);
  assert.notEqual(next.content.id, first.content.id);
});

test("AI must ground the gift in multiple available dates and cannot invent dates", async () => {
  process.env.DEEPSEEK_API_KEY = "fake-key";
  const context = { ...aiContext, jurnal: [...aiContext.jurnal, { ...aiContext.jurnal[0], id: 2, tanggal: "2026-10-15" }] };
  for (const dates of [[], ["2026-10-16"], ["2026-10-16", "2026-10-16"], ["2026-10-16", "2026-10-14"]]) {
    global.fetch = async () => deepseek(selection("quran-tenang", null, dates));
    await assert.rejects(generateGift(context, GIFT_CONTENT));
  }
  global.fetch = async () => deepseek(selection("quran-tenang", null, ["2026-10-16", "2026-10-15"]));
  assert.equal((await generateGift(context, GIFT_CONTENT)).basedOnDates.length, 2);
});

test("malformed personal fields and copied previous introductions use a journal-aware fallback", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(39, [journal("Aku lelah dan kewalahan")]);
  global.fetch = async () => deepseek();
  const first = await openGift(39);
  assert.equal(first.intro, intro);
  mock.timers.tick(3 * 86_400_000);
  global.fetch = async (_url, options) => {
    const input = JSON.parse(JSON.parse(options.body).messages[1].content);
    return deepseek(selection(input.koleksi[0].id)); // Same intro with a valid new content ID.
  };
  const next = await openGift(39);
  assert.notEqual(next.intro, first.intro);
  assert.match(next.personalTitle, /Jeda/);
  for (const changes of [{ reflection: "" }, { smallStep: "https://bad.example" }, { personalTitle: "<b>Judul</b>" }]) {
    global.fetch = async () => deepseek({ ...selection(), ...changes });
    await assert.rejects(generateGift(aiContext, GIFT_CONTENT));
  }
});

test("safety signals prioritize protection and support rather than enduring harm", async () => {
  await setGiftEnabled(true);
  fixtureJournals.set(40, [journal("Aku dipukul dan takut pulang. Aku lelah dan cemas."), journal("Aku berusaha sabar", "2026-10-15", 2)]);
  const gift = await openGift(40);
  assert.match(gift.personalTitle, /aman/);
  assert.match(gift.smallStep, /tempat aman/);
  assert.ok(gift.content.themes.some((t) => ["dukungan", "perlindungan", "pertolongan"].includes(t)));
});

test("all new Quran texts match the unchanged full Tanzil verses and carry attribution", () => {
  assert.equal(GIFT_CONTENT.length, 40);
  const tanzil = GIFT_CONTENT.filter((c) => c.source.additional?.some((s) => s.url === "https://tanzil.net"));
  assert.equal(tanzil.length, 16);
  for (const content of tanzil) {
    const verse = new URL(content.source.url).pathname.slice(1).replace("/", ":");
    assert.equal(content.arabic, TANZIL_GIFT_VERSES[verse]);
    assert.ok(content.source.note.includes("tanpa perubahan"));
  }
  assert.ok(GIFT_CONTENT.some((c) => c.source.additional?.some((s) => s.url.startsWith("https://dorar.net/h/"))));
});

test("personalized card and reader show reflection while sharing keeps personal writing private", async () => {
  await setGiftEnabled(true); fixtureJournals.set(41, [journal("Aku cemas dan khawatir")]);
  const gift = await openGift(41);
  const card = renderToStaticMarkup(await HomeGift({ userId: 41 }));
  assert.ok(card.includes(gift.personalTitle));
  const html = renderToStaticMarkup(React.createElement(GiftBody, { gift }));
  assert.ok(html.includes(gift.personalTitle));
  assert.ok(html.includes(gift.reflection));
  assert.ok(html.includes(gift.smallStep));
  assert.ok(html.includes('translate="no"'));
  const share = giftShareText(gift);
  for (const privateText of [gift.personalTitle, gift.intro, gift.reflection, gift.smallStep]) assert.ok(!share.includes(privateText));
});

test("legacy gifts without personalization fields remain readable and unchanged", async () => {
  await setGiftEnabled(true);
  const period = giftPeriod(setting.enabledAt);
  const saved = { id: randomUUID(), userId: 42, settingVersion: setting.version, periodStart: period.start, expiresAt: period.expiresAt, contentId: "quran-tenang", intro, createdAt: new Date() };
  records.set(key(saved), saved);
  const gift = await openGift(42);
  assert.equal(gift.id, saved.id);
  assert.equal(gift.personalTitle, null);
  assert.equal(gift.reflection, null);
  assert.equal(journalQueries.length, 0);
  const html = renderToStaticMarkup(React.createElement(GiftBody, { gift }));
  assert.ok(html.includes(gift.content.title));
  assert.ok(!html.includes("Untuk direnungkan perlahan"));
});

test("collection exhaustion and unrecognized journal language remain usable without empty candidates", () => {
  const { patterns, ranked } = rankGiftCandidates(aiContext, GIFT_CONTENT.map((c) => c.id), GIFT_CONTENT);
  assert.equal(ranked.length, GIFT_CONTENT.length);
  const best = ranked.filter((r) => r.score === ranked[0].score).map((r) => r.content);
  const gift = fallbackGift(aiContext, best, patterns, "stable");
  assert.ok(GIFT_CONTENT.some((c) => c.id === gift.contentId));
  assert.deepEqual(journalPatterns({ profil: null, jurnal: [] }), []);
});

test("admin can distinguish theme and neutral fallback counts without accessing private messages", async () => {
  await setGiftEnabled(true);
  fixtureJournals.set(43, [journal()]);
  await openGift(43); await openGift(44);
  const overview = await giftAdminOverview();
  assert.equal(overview.themeFallbacks, 1);
  assert.equal(overview.neutralFallbacks, 1);
  assert.ok(!JSON.stringify(overview).includes("personalization"));
  assert.ok(!JSON.stringify(overview).includes("Aku lelah"));
});

test("the LLM receives full source texts, exact references and contextual limitations", async () => {
  process.env.DEEPSEEK_API_KEY = "fake-key";
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.max_tokens, 3200);
    assert.match(request.messages[0].content, /URL adalah referensi/);
    assert.match(request.messages[0].content, /Jangan menambah tokoh, dialog, peristiwa/);
    const { koleksi } = JSON.parse(request.messages[1].content);
    for (const supplied of koleksi) {
      const original = GIFT_CONTENT.find((c) => c.id === supplied.id);
      assert.equal(supplied.arabic, original.arabic);
      assert.equal(supplied.latin, original.latin);
      assert.equal(supplied.meaning, original.meaning);
      assert.deepEqual(supplied.story, original.paragraphs);
      assert.deepEqual(supplied.source, original.source);
    }
    return deepseek();
  };
  const gift = await generateGift(aiContext, GIFT_CONTENT);
  assert.ok(gift.composition.paragraphs.length >= 2);
  assert.deepEqual(gift.composition.sources, [GIFT_CONTENT.find((c) => c.id === gift.contentId)]);
});

test("compositions reject missing, invented, repeated or reordered source references and rewritten quotes", async () => {
  process.env.DEEPSEEK_API_KEY = "fake-key";
  const base = selection();
  const invalid = [
    { ...base, composition: undefined },
    { ...base, composition: { ...base.composition, sourceIds: [] } },
    { ...base, composition: { ...base.composition, sourceIds: ["quran-tenang", "invented-hadith"] } },
    { ...base, composition: { ...base.composition, sourceIds: ["quran-tenang", "quran-tenang"] } },
    { ...base, composition: { ...base.composition, sourceIds: ["dua-lapang", "quran-tenang"] } },
    { ...base, composition: { ...base.composition, sources: [{ arabic: "Invented quote" }] } },
    { ...base, composition: { ...base.composition, paragraphs: ["Kalimat terlalu pendek."] } },
    { ...base, composition: { ...base.composition, paragraphs: ["Allah berfirman bahwa semua masalah kamu pasti selesai besok pagi.", base.composition.paragraphs[1]] } },
    { ...base, composition: { ...base.composition, closing: "Kalimat personal dengan kutipan Arab yang dikarang اللهم" } },
  ];
  for (const output of invalid) {
    global.fetch = async () => deepseek(output);
    await assert.rejects(generateGift(aiContext, GIFT_CONTENT));
  }
  global.fetch = async () => deepseek({ ...base, composition: { ...base.composition, sourceIds: ["quran-tenang", "dua-lapang"] } });
  const valid = await generateGift(aiContext, GIFT_CONTENT);
  assert.deepEqual(valid.composition.sources.map((s) => s.id), ["quran-tenang", "dua-lapang"]);
  assert.equal(valid.composition.sources[1].arabic, GIFT_CONTENT.find((c) => c.id === "dua-lapang").arabic);
  // A known collection ID is still invalid if it was not supplied in this request.
  await assert.rejects(generateGift(aiContext, GIFT_CONTENT.filter((c) => c.id === "quran-tenang")));
});

test("the same verified reading can accompany different journal-grounded personal compositions", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(50, [journal("Aku lelah merawat keluarga.")]);
  fixtureJournals.set(51, [journal("Aku cemas menunggu kabar pekerjaan.")]);
  global.fetch = async (_url, options) => {
    const { kondisi } = JSON.parse(JSON.parse(options.body).messages[1].content);
    const output = selection();
    if (kondisi.jurnal[0].isi.includes("merawat")) {
      output.personalTitle = "Ruang istirahat dalam merawat";
      output.intro = "Merawat orang terdekat bisa menyita banyak tenaga. Kamu boleh mengakui lelah dan memberi ruang bagi kebutuhanmu sendiri sambil tetap menjaga kasih sayang.";
      output.composition.paragraphs[0] = "Kehadiranmu bagi keluarga tidak menghapus kebutuhanmu sendiri untuk beristirahat. Bacaan ini bisa menjadi teman jeda ketika kamu ingin kembali mengingat hal yang menenangkan.";
    } else {
      output.personalTitle = "Menjaga harapan selama menunggu";
      output.intro = "Menunggu kabar bisa membawa banyak pertanyaan yang belum terjawab. Kamu boleh memberi ruang bagi harapan sambil merawat diri selama menjalani ketidakpastian ini.";
      output.composition.paragraphs[0] = "Saat hasil sebuah usaha belum terlihat, ada ruang untuk bersandar dan tetap menjalani hal yang masih dapat kamu upayakan. Bacaan ini bisa menemani jeda di tengah penantianmu.";
    }
    return deepseek(output);
  };
  const first = await openGift(50);
  const other = await openGift(51);
  assert.equal(first.content.id, other.content.id);
  assert.notEqual(first.composition.paragraphs[0], other.composition.paragraphs[0]);
  assert.notEqual(first.intro, other.intro);
  assert.deepEqual(await openGift(50), first);
  assert.deepEqual(await currentGift(51), other);
});

test("all four existing gift kinds support generated compositions with fixed sacred text", async () => {
  process.env.DEEPSEEK_API_KEY = "fake-key";
  for (const kind of ["dua", "story", "quran", "hadith"]) {
    const source = GIFT_CONTENT.find((c) => c.kind === kind);
    global.fetch = async () => deepseek(selection(source.id));
    const gift = await generateGift(aiContext, GIFT_CONTENT);
    assert.equal(gift.composition.sources[0].kind, kind);
    assert.equal(gift.composition.sources[0].arabic, source.arabic);
    assert.deepEqual(gift.composition.sources[0].paragraphs, source.paragraphs);
  }
});

test("story composition and all supporting references render separately from source material and stay private when sharing", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(52, [journal()]);
  const output = selection("story-fatimah");
  output.composition.sourceIds = ["story-fatimah", "hadith-hak-diri"];
  output.composition.paragraphs = [
    "Dalam kisah sumber, Fatimah menyampaikan kelelahan yang dialaminya. Rasulullah kemudian mengajarkan zikir sebelum tidur kepada Fatimah dan Ali, sebagaimana diceritakan dalam riwayat tersebut.",
    "Dari kisah ini, kamu bisa merenungkan bahwa mengakui lelah dan merawat hubungan dengan Allah dapat berjalan bersama. Bila memungkinkan, kamu juga boleh mencari dukungan dalam tanggung jawabmu.",
  ];
  global.fetch = async () => deepseek(output);
  const gift = await openGift(52);
  const html = renderToStaticMarkup(React.createElement(GiftBody, { gift }));
  assert.ok(html.includes("Baca kisah sumber"));
  assert.ok(html.includes("Kisah dan renungan untukmu"));
  assert.ok(html.includes(gift.composition.paragraphs[0]));
  assert.ok(html.includes(gift.composition.closing));
  for (const source of gift.composition.sources) assert.ok(html.includes(source.source.url));
  const shared = giftShareText(gift);
  for (const paragraph of [...gift.composition.paragraphs, gift.composition.closing]) assert.ok(!shared.includes(paragraph));
  assert.ok(shared.includes(gift.content.paragraphs[0]));
});

test("persisted source snapshots survive later collection updates", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(53, [journal()]); global.fetch = async () => deepseek();
  const first = await openGift(53);
  const source = GIFT_CONTENT.find((c) => c.id === first.content.id);
  const originalTitle = source.title;
  const originalMeaning = source.meaning;
  try {
    source.title = "A later editorial revision";
    source.meaning = "A later meaning revision";
    const reloaded = await currentGift(53);
    assert.deepEqual(reloaded, first);
    assert.equal(reloaded.content.title, originalTitle);
    assert.equal(reloaded.content.meaning, originalMeaning);
  } finally {
    source.title = originalTitle; source.meaning = originalMeaning;
  }
});

test("an invalid composition falls back without inventing an AI story or changing the saved period", async () => {
  await setGiftEnabled(true); process.env.DEEPSEEK_API_KEY = "fake-key";
  fixtureJournals.set(54, [journal()]);
  global.fetch = async () => deepseek({ ...selection(), composition: { paragraphs: ["made up"], sourceIds: ["fake"] } });
  const gift = await openGift(54);
  assert.equal(gift.composition, null);
  assert.match(gift.personalTitle, /Jeda/);
  assert.equal([...records.values()][0].aiProvider, "theme-fallback");
  global.fetch = async () => deepseek();
  assert.deepEqual(await openGift(54), gift);
});
