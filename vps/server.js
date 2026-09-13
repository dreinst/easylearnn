// Layanan data Production Book: menyimpan progres belajar dan jurnal (bukti kerja)
// sebagai berkas biasa di satu folder, plus pengingat Web Push harian.
// Tanpa database. Semua endpoint (kecuali /health) butuh header Authorization: Bearer <DATA_TOKEN>.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const webpush = require("web-push");

const PORT = Number(process.env.PORT || 3210);
const DATA_DIR = process.env.DATA_DIR || "/data";
const SEED_FILE = process.env.SEED_FILE || "/seed/topics.json";
const TOKEN = process.env.DATA_TOKEN || "";
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
const MAX_BODY = 6 * 1024 * 1024; // 6 MB (lampiran base64 maksimal sekitar 4 MB)
const PROGRAM_WEEKS = 24;

if (!TOKEN) {
  console.error("DATA_TOKEN belum diisi. Berhenti.");
  process.exit(1);
}

const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");
const JOURNAL_DIR = path.join(DATA_DIR, "jurnal");
const ATTACH_DIR = path.join(JOURNAL_DIR, "lampiran");

const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (pushEnabled) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// ---------- berkas ----------

function ensureDirs() {
  fs.mkdirSync(ATTACH_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

function defaultProgress() {
  return {
    settings: {
      display_name: "",
      timezone: "Asia/Jakarta",
      program_start: null,
      remind_time: "20:00",
      remind_push: true,
    },
    quiz_attempts: [],
    evidence: [],
    study_days: [],
    push_subscriptions: [],
    reminder_log: [],
  };
}

function loadProgress() {
  const p = readJson(PROGRESS_FILE, null);
  if (!p) {
    const fresh = defaultProgress();
    writeJson(PROGRESS_FILE, fresh);
    return fresh;
  }
  return { ...defaultProgress(), ...p, settings: { ...defaultProgress().settings, ...(p.settings || {}) } };
}

function loadContent() {
  const c = readJson(CONTENT_FILE, null);
  if (c) return c;
  const seed = readJson(SEED_FILE, null);
  if (seed) {
    writeJson(CONTENT_FILE, seed);
    console.log("content.json dibuat dari seed");
    return seed;
  }
  return { version: 0, program_weeks: PROGRAM_WEEKS, phases: [], topics: [] };
}

function resetContentFromSeed() {
  const seed = readJson(SEED_FILE, null);
  if (!seed) throw httpError(500, "Seed tidak ditemukan di " + SEED_FILE);
  // pertahankan hasil pengecekan embeddable yang sudah ada
  const old = readJson(CONTENT_FILE, null);
  if (old) {
    const known = new Map();
    for (const t of old.topics || []) for (const s of t.sources || []) known.set(s.url, s);
    for (const t of seed.topics || []) for (const s of t.sources || []) {
      const k = known.get(s.url);
      if (k && k.embeddable !== undefined) {
        s.embeddable = k.embeddable;
        s.embeddable_checked_at = k.embeddable_checked_at;
      }
    }
  }
  writeJson(CONTENT_FILE, seed);
  return seed;
}

// ---------- tanggal (zona waktu profil) ----------

function todayInTz(tz, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function timeInTz(tz, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("hour")}:${get("minute")}`;
}

function addDays(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * 86400000).toISOString().slice(0, 10);
}

function diffDays(a, b) {
  const p = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(b) - p(a)) / 86400000);
}

function weekOf(programStart, today) {
  const days = diffDays(programStart, today);
  if (days < 0) return 0;
  const w = Math.floor(days / 7) + 1;
  return w > PROGRAM_WEEKS ? PROGRAM_WEEKS + 1 : w;
}

function streakCount(studyDays, today) {
  const set = new Set(studyDays.map((d) => d.day));
  let cursor = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cursor)) { n++; cursor = addDays(cursor, -1); }
  return n;
}

function recordStudyDay(progress, trigger) {
  const day = todayInTz(progress.settings.timezone || "Asia/Jakarta");
  if (!progress.study_days.some((d) => d.day === day)) {
    progress.study_days.push({ day, trigger });
    progress.study_days.sort((a, b) => (a.day < b.day ? -1 : 1));
  }
  return day;
}

// ---------- util http ----------

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

function send(res, status, body, headers = {}) {
  const data = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { "content-type": Buffer.isBuffer(body) ? "application/octet-stream" : "application/json; charset=utf-8", ...headers });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(httpError(413, "Berkas terlalu besar (maksimal sekitar 4 MB)")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(httpError(400, "Body bukan JSON")); }
    });
    req.on("error", reject);
  });
}

function safeName(name) {
  return String(name || "berkas").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80);
}

function frontmatter(obj) {
  return "---\n" + Object.entries(obj).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${String(v).replace(/\n/g, " ")}`).join("\n") + "\n---\n";
}

// ---------- handler ----------

async function handle(req, res) {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  const m = req.method;

  if (p === "/health") return send(res, 200, { ok: true, push: pushEnabled, data_dir: DATA_DIR });

  const auth = req.headers.authorization || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const ok = given.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(TOKEN));
  if (!ok) return send(res, 401, { error: "Token tidak valid" });

  // --- konten ---
  if (p === "/content" && m === "GET") return send(res, 200, loadContent());
  if (p === "/content" && m === "PUT") {
    const body = await readBody(req);
    if (!Array.isArray(body.topics) || !Array.isArray(body.phases)) throw httpError(400, "Konten tidak lengkap");
    writeJson(CONTENT_FILE, body);
    return send(res, 200, { ok: true });
  }
  if (p === "/content/reset" && m === "POST") return send(res, 200, resetContentFromSeed());

  // --- progres ---
  if (p === "/progress" && m === "GET") return send(res, 200, loadProgress());
  if (p === "/settings" && m === "PATCH") {
    const body = await readBody(req);
    const progress = loadProgress();
    const s = progress.settings;
    if ("display_name" in body) s.display_name = String(body.display_name || "").slice(0, 80);
    if ("timezone" in body) {
      try { Intl.DateTimeFormat("en", { timeZone: body.timezone }); s.timezone = body.timezone; }
      catch { throw httpError(400, "Zona waktu tidak dikenal"); }
    }
    if ("program_start" in body) {
      if (body.program_start === null) s.program_start = null;
      else if (/^\d{4}-\d{2}-\d{2}$/.test(body.program_start)) s.program_start = body.program_start;
      else throw httpError(400, "Tanggal mulai harus YYYY-MM-DD");
    }
    if ("remind_time" in body) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.remind_time)) throw httpError(400, "Jam pengingat harus HH:MM");
      s.remind_time = body.remind_time;
    }
    if ("remind_push" in body) s.remind_push = Boolean(body.remind_push);
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, s);
  }
  if (p === "/progress/reset" && m === "POST") {
    const progress = loadProgress();
    for (const e of progress.evidence) removeEvidenceFiles(e);
    const fresh = defaultProgress();
    fresh.settings = { ...progress.settings, program_start: null };
    fresh.push_subscriptions = progress.push_subscriptions;
    writeJson(PROGRESS_FILE, fresh);
    return send(res, 200, { ok: true });
  }

  // --- kuis ---
  if (p === "/quiz-attempts" && m === "POST") {
    const body = await readBody(req);
    if (typeof body.topic !== "string" || !Array.isArray(body.answers)) throw httpError(400, "Data kuis tidak lengkap");
    const progress = loadProgress();
    const attempt = {
      id: crypto.randomUUID(),
      topic: body.topic,
      answers: body.answers.map(Number),
      score: Number(body.score),
      total: Number(body.total),
      passed: Boolean(body.passed),
      attempted_at: new Date().toISOString(),
    };
    progress.quiz_attempts.push(attempt);
    const day = recordStudyDay(progress, "quiz");
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, { attempt, study_day: day });
  }

  // --- bukti kerja / jurnal ---
  if (p === "/evidence" && m === "POST") {
    const body = await readBody(req);
    if (typeof body.topic !== "string" || !body.topic) throw httpError(400, "Topik wajib");
    const note = String(body.note || "").trim();
    const link = body.link ? String(body.link).trim() : null;
    if (!note && !link && !body.file_base64) throw httpError(400, "Isi catatan, tautan, atau lampiran");
    const progress = loadProgress();
    const id = crypto.randomUUID().slice(0, 8);
    const tz = progress.settings.timezone || "Asia/Jakarta";
    const day = todayInTz(tz);
    let file = null;
    if (body.file_base64) {
      const name = `${id}-${safeName(body.file_name)}`;
      fs.writeFileSync(path.join(ATTACH_DIR, name), Buffer.from(String(body.file_base64), "base64"));
      file = name;
    }
    const title = String(body.title || "").trim() || `Bukti kerja ${body.topic}`;
    const journalFile = `${day}-${safeName(body.topic)}-${id}.md`;
    const md = frontmatter({ id, topic: body.topic, title, date: new Date().toISOString(), link, file: file ? `lampiran/${file}` : null }) + "\n" + (note || "(tanpa catatan)") + "\n";
    fs.writeFileSync(path.join(JOURNAL_DIR, journalFile), md);
    const entry = { id, topic: body.topic, title, note, link, file, journal_file: journalFile, submitted_at: new Date().toISOString() };
    progress.evidence.push(entry);
    recordStudyDay(progress, "evidence");
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, entry);
  }
  const evMatch = p.match(/^\/evidence\/([A-Za-z0-9-]+)$/);
  if (evMatch && m === "DELETE") {
    const progress = loadProgress();
    const idx = progress.evidence.findIndex((e) => e.id === evMatch[1]);
    if (idx < 0) throw httpError(404, "Bukti kerja tidak ditemukan");
    removeEvidenceFiles(progress.evidence[idx]);
    progress.evidence.splice(idx, 1);
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, { ok: true });
  }
  const fileMatch = p.match(/^\/files\/([A-Za-z0-9._-]+)$/);
  if (fileMatch && m === "GET") {
    const file = path.join(ATTACH_DIR, fileMatch[1]);
    if (!fs.existsSync(file)) throw httpError(404, "Berkas tidak ada");
    return send(res, 200, fs.readFileSync(file));
  }
  if (p === "/journal" && m === "GET") {
    const files = fs.readdirSync(JOURNAL_DIR).filter((f) => f.endsWith(".md")).sort().reverse();
    return send(res, 200, files.map((f) => ({ file: f, content: fs.readFileSync(path.join(JOURNAL_DIR, f), "utf8") })));
  }

  // --- push ---
  if (p === "/push/public-key" && m === "GET") return send(res, 200, { key: VAPID_PUBLIC_KEY, enabled: pushEnabled });
  if (p === "/push/subscriptions" && m === "POST") {
    const body = await readBody(req);
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) throw httpError(400, "Subscription tidak lengkap");
    const progress = loadProgress();
    progress.push_subscriptions = progress.push_subscriptions.filter((s) => s.endpoint !== body.endpoint);
    progress.push_subscriptions.push({ endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth }, created_at: new Date().toISOString() });
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, { ok: true, count: progress.push_subscriptions.length });
  }
  if (p === "/push/subscriptions" && m === "DELETE") {
    const body = await readBody(req);
    const progress = loadProgress();
    progress.push_subscriptions = progress.push_subscriptions.filter((s) => s.endpoint !== body.endpoint);
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, { ok: true, count: progress.push_subscriptions.length });
  }
  if (p === "/push/test" && m === "POST") {
    const progress = loadProgress();
    const result = await sendPushToAll(progress, { title: "Production Book", body: "Notifikasi uji berhasil masuk.", url: APP_URL + "/" });
    writeJson(PROGRESS_FILE, progress);
    return send(res, 200, result);
  }

  throw httpError(404, "Rute tidak ada");
}

function removeEvidenceFiles(e) {
  for (const f of [e.journal_file && path.join(JOURNAL_DIR, e.journal_file), e.file && path.join(ATTACH_DIR, e.file)]) {
    if (f && fs.existsSync(f)) fs.unlinkSync(f);
  }
}

async function sendPushToAll(progress, payload) {
  if (!pushEnabled) return { sent: 0, failed: 0, removed: 0, detail: "VAPID belum diisi" };
  let sent = 0, failed = 0, removed = 0;
  const keep = [];
  for (const sub of progress.push_subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload), { TTL: 3600 });
      sent++;
      keep.push(sub);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) { removed++; }
      else { failed++; keep.push(sub); console.error("push gagal", err.statusCode, err.body || err.message); }
    }
  }
  progress.push_subscriptions = keep;
  return { sent, failed, removed };
}

// ---------- penjadwal: pengingat harian + pengecek embeddable ----------

async function reminderTick() {
  const progress = loadProgress();
  const s = progress.settings;
  if (!s.program_start || !s.remind_push) return;
  const tz = s.timezone || "Asia/Jakarta";
  const now = new Date();
  if (timeInTz(tz, now) !== s.remind_time) return;
  const today = todayInTz(tz, now);
  if (progress.reminder_log.some((l) => l.day === today && l.channel === "push" && l.status === "sent")) return;
  if (progress.study_days.some((d) => d.day === today)) {
    progress.reminder_log.push({ day: today, channel: "push", status: "skipped_studied", detail: "", sent_at: now.toISOString() });
    writeJson(PROGRESS_FILE, progress);
    return;
  }
  const content = loadContent();
  const week = weekOf(s.program_start, today);
  const topics = (content.topics || []).filter((t) => t.week_from != null && t.week_from <= week && week <= t.week_to);
  const topic = topics[0];
  const streak = streakCount(progress.study_days, today);
  const title = week === 0 ? "Program belum mulai" : week > PROGRAM_WEEKS ? "Program selesai" : `Minggu ${week}: ${topic ? topic.title : "tanpa topik"}`;
  const body = `Streak ${streak} hari, belum tercatat hari ini. Kerjakan kuis atau unggah bukti kerja.`;
  const url = APP_URL + (topic ? `/topic/${topic.slug}` : "/");
  const r = await sendPushToAll(progress, { title, body, url });
  progress.reminder_log.push({ day: today, channel: "push", status: r.sent > 0 ? "sent" : "failed", detail: JSON.stringify(r), sent_at: now.toISOString() });
  if (progress.reminder_log.length > 400) progress.reminder_log = progress.reminder_log.slice(-400);
  writeJson(PROGRESS_FILE, progress);
  console.log("pengingat", today, r);
}

async function checkEmbeddable(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (ProductionBook embed check)" } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (ProductionBook embed check)" } });
    if (!r.ok) return false;
    const xfo = (r.headers.get("x-frame-options") || "").toLowerCase();
    if (xfo.includes("deny") || xfo.includes("sameorigin")) return false;
    const csp = (r.headers.get("content-security-policy") || "").toLowerCase();
    if (/frame-ancestors\s+([^;]*)/.test(csp)) {
      const val = csp.match(/frame-ancestors\s+([^;]*)/)[1];
      if (!val.includes("*")) return false;
    }
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

let embedRunning = false;
async function embeddableTick() {
  if (embedRunning) return;
  const content = loadContent();
  const tz = loadProgress().settings.timezone || "Asia/Jakarta";
  const today = todayInTz(tz);
  const due = [];
  for (const t of content.topics || []) for (const s of t.sources || []) {
    const checked = s.embeddable_checked_at ? s.embeddable_checked_at.slice(0, 10) : null;
    if (s.embeddable == null || !checked || diffDays(checked, today) >= 7) due.push(s);
  }
  if (!due.length) return;
  embedRunning = true;
  try {
    for (const s of due) {
      s.embeddable = await checkEmbeddable(s.url);
      s.embeddable_checked_at = new Date().toISOString();
    }
    writeJson(CONTENT_FILE, content);
    console.log(`embeddable dicek: ${due.length} sumber`);
  } finally {
    embedRunning = false;
  }
}

// ---------- mulai ----------

ensureDirs();
loadContent();
loadProgress();

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    send(res, status, { error: err.message || "Kesalahan server" });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`easylearn-data siap di :${PORT}, data di ${DATA_DIR}, push ${pushEnabled ? "aktif" : "nonaktif"}`);
});

setInterval(() => reminderTick().catch((e) => console.error("reminder", e)), 60 * 1000);
setTimeout(() => embeddableTick().catch((e) => console.error("embeddable", e)), 15 * 1000);
setInterval(() => embeddableTick().catch((e) => console.error("embeddable", e)), 6 * 60 * 60 * 1000);
