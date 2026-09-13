// Semua fungsi memakai string tanggal "YYYY-MM-DD" agar bebas dari bug zona waktu.

const DAY_MS = 86_400_000;

export function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z"));
}

function toUtcMs(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(ymd: string, n: number): string {
  return fromUtcMs(toUtcMs(ymd) + n * DAY_MS);
}

/** Selisih hari b - a (positif kalau b setelah a). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}

/** Tanggal lokal "YYYY-MM-DD" untuk instan `now` di zona waktu `tz`. */
export function todayInTz(tz: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Jam lokal "HH:MM" untuk instan `now` di zona waktu `tz`. */
export function timeInTz(tz: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("hour")}:${get("minute")}`;
}

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Format ringkas Indonesia, contoh "Sen 14 Sep 2026". */
export function formatYmd(ymd: string, withDay = false): string {
  const ms = toUtcMs(ymd);
  const d = new Date(ms);
  const base = `${d.getUTCDate()} ${MONTHS_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return withDay ? `${DAYS_ID[d.getUTCDay()]} ${base}` : base;
}

export function formatRange(from: string, to: string): string {
  const a = new Date(toUtcMs(from));
  const b = new Date(toUtcMs(to));
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()} sampai ${b.getUTCDate()} ${MONTHS_ID[a.getUTCMonth()]} ${a.getUTCFullYear()}`;
  }
  return `${formatYmd(from)} sampai ${formatYmd(to)}`;
}
