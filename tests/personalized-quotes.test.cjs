/* eslint-disable @typescript-eslint/no-require-imports -- Register isolated server mocks before loading TypeScript modules. */
const { test, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { registerHooks } = require("node:module");
const { randomUUID, createHash } = require("node:crypto");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const ts = require("typescript");

const root = resolve(__dirname, "..");
const journals = new Map();
const quotes = new Map();
const journalQueries = [];
const keyOf = ({ userId, date, sourceHash }) => `${userId}:${date.toISOString()}:${sourceHash}`;
global.__quoteTestDb = {
  promptResponse: {
    findFirst: async (query) => { journalQueries.push(query); return journals.get(query.where.userId) ?? null; },
  },
  dailyQuote: {
    findUnique: async ({ where }) => quotes.get(keyOf(where.userId_date_sourceHash)) ?? null,
    upsert: async ({ create }) => {
      const key = keyOf(create);
      if (!quotes.has(key)) quotes.set(key, { ...create, id: randomUUID(), createdAt: new Date() });
      const row = quotes.get(key);
      return { id: row.id, text: row.text };
    },
    findFirst: async ({ where }) => {
      const row = [...quotes.values()]
        .filter((q) => (where.id === undefined || q.id === where.id) && q.userId === where.userId && q.date.getTime() === where.date.getTime())
        .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))[0];
      return row ? { id: row.id, text: row.text } : null;
    },
  },
};

// Tests run with Node 24+ and the project's TypeScript dependency; no real DB or AI calls.
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const base = resolve(root, "src", specifier.slice(2));
      const file = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    if (specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)) {
      const base = fileURLToPath(new URL(specifier, context.parentURL));
      const file = [`${base}.ts`, `${base}.tsx`].find(existsSync);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.includes("/node_modules/server-only/")) return { format: "commonjs", source: "", shortCircuit: true };
    if (url === pathToFileURL(resolve(root, "src/lib/db.ts")).href) {
      return { format: "commonjs", source: "module.exports = { db: global.__quoteTestDb };", shortCircuit: true };
    }
    if (url === pathToFileURL(resolve(root, "src/lib/server/session.ts")).href) {
      return { format: "commonjs", source: `module.exports = { requireMemberApi: async () => {
        if (!global.__quoteTestUser) throw new (require('@/lib/server/errors').ApiError)(401, 'Sesi berakhir.');
        return global.__quoteTestUser;
      }};`, shortCircuit: true };
    }
    if (url.startsWith(pathToFileURL(resolve(root, "src")).href) && /\.tsx?$/.test(url)) {
      const source = require("node:fs").readFileSync(fileURLToPath(url), "utf8");
      return { format: "commonjs", source: ts.transpileModule(source, {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      }).outputText, shortCircuit: true };
    }
    return next(url, context);
  },
});

const { getHomeQuote, getQuoteForStory } = require("../src/server/member/quote.ts");
const { generateJournalQuote } = require("../src/lib/server/quote-ai.ts");
const { quoteForDate, quoteBackgroundForDate } = require("../src/data/member.ts");
const { GET } = require("../src/app/api/quotes/story/route.ts");
const { quoteStoryImage } = require("../src/components/quote-story-image.tsx");
const { HomeQuoteCard } = require("../src/components/home-quote.tsx");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const originalFetch = global.fetch;
const originalWarn = console.warn;
const originalKey = process.env.DEEPSEEK_API_KEY;
const originalModel = process.env.DEEPSEEK_MODEL;
const day = "2026-10-16";
const message = "Kamu boleh mengambil jeda. Satu langkah kecil sudah cukup untuk hari yang terasa berat.";
const success = (quote = message) => Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ quote }) } }] });
const fixture = (id, changes = {}) => ({
  id, updatedAt: new Date("2026-10-16T01:00:00Z"), content: "Aku lelah dan khawatir menghadapi banyak pekerjaan.", answers: [], ...changes,
});

afterEach(() => {
  global.fetch = originalFetch;
  console.warn = originalWarn;
  delete global.__quoteTestUser;
  process.env.DEEPSEEK_API_KEY = "test-key-never-sent";
  delete process.env.DEEPSEEK_MODEL;
});
after(() => {
  hooks.deregister();
  delete global.__quoteTestDb;
  if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.DEEPSEEK_MODEL; else process.env.DEEPSEEK_MODEL = originalModel;
});
process.env.DEEPSEEK_API_KEY = "test-key-never-sent";
delete process.env.DEEPSEEK_MODEL;

test("missing key, missing journal, and empty journal use defaults without AI", async () => {
  global.fetch = () => { throw new Error("Must not call the provider"); };
  delete process.env.DEEPSEEK_API_KEY;
  assert.deepEqual(await getHomeQuote(101, day), { text: quoteForDate(day) });
  process.env.DEEPSEEK_API_KEY = "test-key-never-sent";
  assert.deepEqual(await getHomeQuote(102, day), { text: quoteForDate(day) });
  journals.set(103, fixture(103, { content: "", answers: [] }));
  assert.deepEqual(await getHomeQuote(103, day), { text: quoteForDate(day) });
});

test("uses the owner's latest save, including private note and prompt answers, then reuses stored output", async () => {
  journals.set(110, fixture(110, { answers: [{ value: "Cemas", question: { label: "Bagaimana perasaanmu?" } }] }));
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-key-never-sent");
    assert.equal(options.cache, "no-store");
    const body = JSON.parse(options.body);
    assert.equal(body.model, "deepseek-flash");
    assert.deepEqual(body.thinking, { type: "disabled" });
    assert.deepEqual(body.response_format, { type: "json_object" });
    assert.equal(body.messages[0].role, "system");
    const context = JSON.parse(body.messages[1].content);
    assert.match(context.jurnal, /Aku lelah/);
    assert.match(context.jurnal, /Bagaimana perasaanmu\?: Cemas/);
    assert.deepEqual(Object.keys(context), ["jurnal"]);
    return success();
  };
  const result = await getHomeQuote(110, day);
  assert.equal(result.text, message);
  assert.ok(result.id);
  assert.deepEqual(await getHomeQuote(110, day), result);
  assert.equal(calls, 1);
  const query = journalQueries.find((q) => q.where.userId === 110);
  assert.deepEqual(query.where, { userId: 110 });
  assert.deepEqual(query.orderBy, [{ answeredAt: "desc" }, { id: "desc" }]);
  assert.equal(query.select.attachments, undefined);
});

test("concurrent page requests coalesce into one AI request", async () => {
  journals.set(120, fixture(120));
  let calls = 0;
  global.fetch = async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return success(); };
  const results = await Promise.all(Array.from({ length: 5 }, () => getHomeQuote(120, day)));
  assert.equal(calls, 1);
  assert.ok(results.every((r) => r.id === results[0].id));
});

test("journal edits and new submissions keep the daily quote; new days and users get separate snapshots", async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return success(); };
  journals.set(130, fixture(130));
  const first = await getHomeQuote(130, day);
  journals.set(130, fixture(130, { content: "Hari ini aku bersyukur dan lebih tenang.", updatedAt: new Date("2026-10-16T02:00:00Z") }));
  const edited = await getHomeQuote(130, day);
  assert.deepEqual(edited, first);
  journals.set(130, fixture(132, { content: "Jurnal baru setelah menyelesaikan jurnal sebelumnya." }));
  assert.deepEqual(await getHomeQuote(130, day), first);
  const tomorrow = await getHomeQuote(130, "2026-10-17");
  journals.set(131, fixture(131));
  const other = await getHomeQuote(131, day);
  assert.equal(new Set([first.id, tomorrow.id, other.id]).size, 3);
  assert.equal(calls, 3);
  assert.equal((await getQuoteForStory(130, day, first.id)).text, first.text);
  assert.equal(await getQuoteForStory(131, day, first.id), null);
  assert.equal(await getQuoteForStory(130, "2026-10-17", first.id), null);
});

test("legacy snapshots remain stable even when the journal or provider configuration changes", async () => {
  const first = { userId: 135, date: new Date(`${day}T00:00:00Z`), sourceHash: "legacy-first", id: randomUUID(), text: message, createdAt: new Date("2026-10-16T01:00:00Z") };
  const second = { ...first, sourceHash: "legacy-second", id: randomUUID(), text: "Pesan dari revisi jurnal berikutnya.", createdAt: new Date("2026-10-16T02:00:00Z") };
  quotes.set(keyOf(second), second);
  quotes.set(keyOf(first), first);
  global.fetch = () => { throw new Error("Must reuse the saved quote"); };
  delete process.env.DEEPSEEK_API_KEY;
  assert.deepEqual(await getHomeQuote(135, day), { id: first.id, text: first.text });
  process.env.DEEPSEEK_API_KEY = "test-key-never-sent";
  process.env.DEEPSEEK_MODEL = "another-model";
  journals.set(135, fixture(135));
  assert.deepEqual(await getHomeQuote(135, day), { id: first.id, text: first.text });
  assert.equal((await getQuoteForStory(135, day, second.id)).text, second.text);
});

test("a journal submitted while generation is pending shares the same daily snapshot", async () => {
  journals.set(136, fixture(136));
  let started;
  const generating = new Promise((resolve) => { started = resolve; });
  let finish;
  const response = new Promise((resolve) => { finish = resolve; });
  let calls = 0;
  global.fetch = async () => { calls++; started(); return response; };
  const first = getHomeQuote(136, day);
  await generating;
  journals.set(136, fixture(137));
  const afterSubmit = getHomeQuote(136, day);
  finish(success());
  const results = await Promise.all([first, afterSubmit]);
  assert.deepEqual(results[0], results[1]);
  assert.equal(calls, 1);
});

test("prompt-only journals work and long journals preserve their opening and ending", async () => {
  journals.set(140, fixture(140, { content: "", answers: [{ value: "Aku butuh istirahat.", question: { label: "Apa yang kamu butuhkan?" } }] }));
  global.fetch = async (_url, options) => {
    assert.match(JSON.parse(JSON.parse(options.body).messages[1].content).jurnal, /Aku butuh istirahat/);
    return success();
  };
  assert.ok((await getHomeQuote(140, day)).id);
  journals.set(141, fixture(141, { content: "AWAL " + "cerita ".repeat(6000) + " AKHIR" }));
  global.fetch = async (_url, options) => {
    const text = JSON.parse(JSON.parse(options.body).messages[1].content).jurnal;
    assert.ok(text.length < 20_020);
    assert.ok(text.startsWith("AWAL ") && text.endsWith(" AKHIR"));
    return success();
  };
  assert.ok((await getHomeQuote(141, day)).id);
});

test("invalid, empty, truncated, and unsafe-format model outputs are rejected", async () => {
  for (const content of ["not-json", "", JSON.stringify({ quote: "a".repeat(181) }), JSON.stringify({ quote: "Lihat https://example.com untuk pesan lebih lengkap." }), JSON.stringify({ quote: "Pesan <script>yang tidak boleh ditampilkan</script>" })]) {
    global.fetch = async () => Response.json({ choices: [{ finish_reason: "stop", message: { content } }] });
    await assert.rejects(generateJournalQuote("Jurnal uji"));
  }
  global.fetch = async () => Response.json({ choices: [{ finish_reason: "length", message: { content: JSON.stringify({ quote: message }) } }] });
  await assert.rejects(generateJournalQuote("Jurnal uji"));
});

test("provider errors fall back without persisting a fake AI quote and back off", async () => {
  journals.set(150, fixture(150));
  let calls = 0;
  global.fetch = async () => { calls++; return new Response("private provider body", { status: 429 }); };
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  const before = quotes.size;
  assert.deepEqual(await getHomeQuote(150, day), { text: quoteForDate(day) });
  assert.deepEqual(await getHomeQuote(150, day), { text: quoteForDate(day) });
  journals.set(150, fixture(152, { content: "Jurnal baru saat provider sedang gagal." }));
  assert.deepEqual(await getHomeQuote(150, day), { text: quoteForDate(day) });
  assert.equal(calls, 1);
  assert.equal(quotes.size, before);
  assert.ok(!JSON.stringify(warnings).includes("private provider body"));
  journals.set(151, fixture(151));
  global.fetch = async () => { throw new DOMException("Timed out", "TimeoutError"); };
  assert.deepEqual(await getHomeQuote(151, day), { text: quoteForDate(day) });
});

test("generation rate limit does not disable persisted results", async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return success(); };
  let first;
  for (let i = 0; i < 13; i++) {
    journals.set(160, fixture(160, { content: `Cerita revisi ${i}` }));
    const result = await getHomeQuote(160, `2026-10-${String(16 + i).padStart(2, "0")}`);
    if (i === 0) first = result;
    assert.equal(Boolean(result.id), i < 12);
  }
  assert.equal(calls, 12);
  journals.set(160, fixture(160, { content: "Cerita revisi 0" }));
  assert.equal((await getHomeQuote(160, day)).id, first.id);
});

test("Home card carries only its quote snapshot ID and uses the date's background", async () => {
  journals.set(170, fixture(170));
  global.fetch = async () => success();
  const quote = await getHomeQuote(170, day);
  const html = renderToStaticMarkup(React.createElement(HomeQuoteCard, { date: day, quote }));
  assert.ok(html.includes(quote.text));
  assert.ok(html.includes(quoteBackgroundForDate(day)));
  assert.ok(!html.includes(journals.get(170).content));
  // Inspect the server element tree because the closed share dialog doesn't render its image URL.
  const tree = HomeQuoteCard({ date: day, quote });
  const share = tree.props.children[0];
  const url = new URL(share.props.imagePath, "http://localhost");
  assert.equal(url.searchParams.get("quoteId"), quote.id);
  assert.equal(url.searchParams.get("date"), day);
  assert.ok(!url.search.includes("jurnal"));
});

test("Story requires login, checks snapshot ownership/date, and renders exactly the saved text", async () => {
  const quote = [...quotes.values()].find((q) => q.userId === 170);
  const request = (query = "") => GET(new Request(`http://localhost/api/quotes/story?date=${day}${query}`), { params: Promise.resolve({}) });
  assert.equal((await request(`&quoteId=${quote.id}`)).status, 401);
  global.__quoteTestUser = { id: 171 };
  assert.equal((await request(`&quoteId=${quote.id}`)).status, 404);
  global.__quoteTestUser = { id: 170 };
  assert.equal((await request("&quoteId=invalid")).status, 400);
  const wrongDay = await GET(new Request(`http://localhost/api/quotes/story?date=2026-10-17&quoteId=${quote.id}`), { params: Promise.resolve({}) });
  assert.equal(wrongDay.status, 404);
  const result = await request(`&quoteId=${quote.id}`);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  const png = Buffer.from(await result.arrayBuffer());
  assert.equal(png.readUInt32BE(16), 1080);
  assert.equal(png.readUInt32BE(20), 1920);
  const expected = quoteStoryImage({
    quote: quote.text,
    background: `data:image/jpeg;base64,${require("node:fs").readFileSync(resolve(root, `public${quoteBackgroundForDate(day)}`)).toString("base64")}`,
    logo: `data:image/png;base64,${require("node:fs").readFileSync(resolve(root, "public/images/logo-header.png")).toString("base64")}`,
  });
  assert.equal(createHash("sha256").update(png).digest("hex"), createHash("sha256").update(Buffer.from(await expected.arrayBuffer())).digest("hex"));
  assert.equal((await request()).status, 200);
});
