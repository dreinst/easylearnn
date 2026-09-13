"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Phase, TopicStatus } from "@/lib/types";
import { phaseDates, weekEnd, weekStart } from "@/lib/timeline";
import { formatRange, formatYmd, isYmd } from "@/lib/dates";
import PushButton from "@/components/PushButton";
import Icon from "@/components/Icon";

type T = { slug: string; title: string; phase_id: number; week_from: number; week_to: number };

const TIMEZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "Asia/Kuala_Lumpur"];

export default function RoadmapForm({
  phases, topics, ongoing, initialStart, initialRemind, initialTz, alreadyStarted, pushKey, pushEnabled, totalWeeks, statuses, locked,
}: {
  phases: Phase[]; topics: T[]; ongoing: { slug: string; title: string }[];
  initialStart: string; initialRemind: string; initialTz: string; alreadyStarted: boolean;
  pushKey: string; pushEnabled: boolean; totalWeeks: number;
  statuses: Record<string, TopicStatus>; locked: string[];
}) {
  const router = useRouter();
  const [start, setStart] = useState(initialStart);
  const [remind, setRemind] = useState(initialRemind);
  const [tz, setTz] = useState(initialTz);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = isYmd(start);
  const lockedSet = new Set(locked);

  const endDate = useMemo(() => (valid ? weekEnd(start, totalWeeks) : ""), [start, valid, totalWeeks]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ program_start: start, remind_time: remind, timezone: tz }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Gagal menyimpan");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const shortDate = (ymd: string) => formatYmd(ymd).replace(/ \d{4}$/, "");

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-4">
        <div>
          <label className="label" htmlFor="start">Tanggal mulai</label>
          <input id="start" type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="remind">Jam pengingat</label>
          <input id="remind" type="time" className="input" value={remind} onChange={(e) => setRemind(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="tz">Zona waktu</label>
          <select id="tz" className="input" value={tz} onChange={(e) => setTz(e.target.value)}>
            {[...new Set([initialTz, ...TIMEZONES])].map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-accent h-11 w-full" disabled={busy || !valid}>{busy ? "Menyimpan" : alreadyStarted ? "Simpan perubahan" : "Mulai program"}</button>
        </div>
        {valid && <p className="text-sm text-mute md:col-span-4">Program berjalan {formatYmd(start, true)} sampai {formatYmd(endDate, true)}. Pengingat dikirim pukul {remind} ({tz}) kalau hari itu belum kuis.</p>}
        {error && <p className="text-sm font-semibold text-red-700 md:col-span-4">{error}</p>}
      </form>

      <div className="card">
        <h2 className="text-lg font-bold text-navy">Notifikasi ke HP (opsional, bisa nanti di pengaturan)</h2>
        <p className="mt-1 text-sm text-mute">Pengingat masuk sebagai notifikasi browser meski tab ditutup. Di iPhone, pasang dulu app ini ke layar utama (Share, Add to Home Screen) lalu aktifkan dari dalam app.</p>
        <div className="mt-3"><PushButton publicKey={pushKey} enabled={pushEnabled} /></div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-navy">Jalur lintasan kurikulum</h2>
            <p className="text-sm text-mute">Enam fase berurutan, dari fondasi sampai orang dan hasil.</p>
          </div>
          {alreadyStarted && (
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.04em] text-mute">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-mint" />Selesai</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />Terbuka</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-line" />Terkunci</span>
            </div>
          )}
        </div>

        <ol className="space-y-6">
          {phases.filter((p) => p.id !== 0).map((p) => {
            const d = valid ? phaseDates(start, p) : null;
            const items = topics.filter((t) => t.phase_id === p.id);
            const passed = items.filter((t) => statuses[t.slug]?.quiz_passed).length;
            const allDone = items.length > 0 && passed === items.length;
            return (
              <li key={p.id} className="card">
                <div className="flex flex-wrap items-start gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${allDone ? "bg-mint/10 text-mint-2" : "bg-cream-2 text-navy"}`}>{String(p.id).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-navy">Fase {p.id}: {p.name}</h3>
                      {alreadyStarted && (allDone ? <span className="badge-ok">Tuntas</span> : passed > 0 ? <span className="badge-accent">{passed}/{items.length} kuis lulus</span> : null)}
                    </div>
                    <div className="text-xs font-semibold text-mute">Minggu {p.week_from} sampai {p.week_to}{d ? ` · ${formatRange(d.from, d.to)}` : ""}</div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/90">{p.rationale}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t) => {
                    const st = statuses[t.slug];
                    const isLocked = alreadyStarted && lockedSet.has(t.slug);
                    const code = `M${String(t.week_from).padStart(2, "0")}${t.week_to !== t.week_from ? `-${String(t.week_to).padStart(2, "0")}` : ""}`;
                    const inner = (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-mute">{code}</span>
                          {alreadyStarted && (isLocked ? <Icon name="lock" className="h-3.5 w-3.5 text-mute" /> : st?.quiz_passed ? <Icon name="check-circle" className="h-4 w-4 text-mint" /> : <span className="h-2 w-2 rounded-full bg-accent" />)}
                        </div>
                        <div className="mt-2 text-sm font-bold leading-snug text-navy">{t.title}</div>
                        <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-mute">
                          <span>{valid ? `Mulai ${shortDate(weekStart(start, t.week_from))}` : ""}</span>
                          {alreadyStarted && st?.attempts ? <span>{st.quiz_passed ? "Kuis lulus" : "Kuis belum lulus"}</span> : null}
                        </div>
                      </>
                    );
                    const cls = `block rounded-xl border border-navy/8 bg-cream/60 p-4 transition-all ${isLocked ? "opacity-60" : "hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white hover:shadow-card"}`;
                    return alreadyStarted && !isLocked ? (
                      <Link key={t.slug} href={`/topic/${t.slug}`} className={cls}>{inner}</Link>
                    ) : (
                      <div key={t.slug} className={cls} title={isLocked ? "Terkunci: selesaikan modul sebelumnya" : undefined}>{inner}</div>
                    );
                  })}
                </div>
              </li>
            );
          })}
          <li className="card">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber-2"><Icon name="sparkle" className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-navy">Sepanjang program</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/90">{phases.find((p) => p.id === 0)?.rationale}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ongoing.map((t) => (
                    <li key={t.slug}>
                      {alreadyStarted ? (
                        <Link href={`/topic/${t.slug}`} className={`badge ${statuses[t.slug]?.quiz_passed ? "bg-mint/10 text-mint-2" : "bg-cream-2 text-navy"} px-3 py-1.5 hover:bg-cream`}>{t.title}</Link>
                      ) : (
                        <span className="badge bg-cream-2 px-3 py-1.5 text-navy">{t.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <p className="text-sm font-semibold text-mute">Aturan main: hari belajar tercatat kalau kamu mengerjakan kuis. Topik dianggap selesai kalau kuisnya sudah lulus.</p>
    </div>
  );
}
