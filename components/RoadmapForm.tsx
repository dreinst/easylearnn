"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Phase } from "@/lib/types";
import { phaseDates, weekEnd, weekStart } from "@/lib/timeline";
import { formatRange, formatYmd, isYmd } from "@/lib/dates";
import PushButton from "@/components/PushButton";

type T = { slug: string; title: string; phase_id: number; week_from: number; week_to: number };

const TIMEZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "Asia/Kuala_Lumpur"];

export default function RoadmapForm({
  phases, topics, ongoing, initialStart, initialRemind, initialTz, alreadyStarted, pushKey, pushEnabled, totalWeeks,
}: {
  phases: Phase[]; topics: T[]; ongoing: { slug: string; title: string }[];
  initialStart: string; initialRemind: string; initialTz: string; alreadyStarted: boolean;
  pushKey: string; pushEnabled: boolean; totalWeeks: number;
}) {
  const router = useRouter();
  const [start, setStart] = useState(initialStart);
  const [remind, setRemind] = useState(initialRemind);
  const [tz, setTz] = useState(initialTz);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = isYmd(start);

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

  return (
    <div className="space-y-6">
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
          <button className="btn-orange w-full" disabled={busy || !valid}>{busy ? "Menyimpan" : alreadyStarted ? "Simpan perubahan" : "Mulai program"}</button>
        </div>
        {valid && <p className="text-sm text-mute md:col-span-4">Program berjalan {formatYmd(start, true)} sampai {formatYmd(endDate, true)}. Pengingat dikirim pukul {remind} ({tz}) kalau hari itu belum ada kuis atau bukti kerja.</p>}
        {error && <p className="text-sm text-red-700 md:col-span-4">{error}</p>}
      </form>

      <div className="card">
        <h2 className="font-semibold text-navy">Notifikasi ke HP (opsional, bisa nanti di pengaturan)</h2>
        <p className="mt-1 text-sm text-mute">Pengingat masuk sebagai notifikasi browser meski tab ditutup. Di iPhone, pasang dulu app ini ke layar utama (Share, Add to Home Screen) lalu aktifkan dari dalam app.</p>
        <div className="mt-3"><PushButton publicKey={pushKey} enabled={pushEnabled} /></div>
      </div>

      <ol className="space-y-4">
        {phases.filter((p) => p.id !== 0).map((p) => {
          const d = valid ? phaseDates(start, p) : null;
          return (
            <li key={p.id} className="card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-navy">Fase {p.id}: {p.name}</h2>
                <span className="font-mono text-xs text-mute">Minggu {p.week_from} sampai {p.week_to}{d ? ` · ${formatRange(d.from, d.to)}` : ""}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{p.rationale}</p>
              <ul className="mt-3 divide-y divide-line text-sm">
                {topics.filter((t) => t.phase_id === p.id).map((t) => (
                  <li key={t.slug} className="flex items-center gap-3 py-1.5">
                    <span className="w-16 shrink-0 font-mono text-xs text-mute">M{t.week_from}{t.week_to !== t.week_from ? `-${t.week_to}` : ""}</span>
                    <span className="min-w-0 flex-1">{alreadyStarted ? <Link href={`/topic/${t.slug}`} className="hover:underline">{t.title}</Link> : t.title}</span>
                    {valid && <span className="shrink-0 font-mono text-[11px] text-mute">{formatYmd(weekStart(start, t.week_from)).replace(/ \d{4}$/, "")}</span>}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
        <li className="card">
          <h2 className="text-lg font-bold text-navy">Sepanjang program</h2>
          <p className="mt-2 text-sm leading-relaxed">{phases.find((p) => p.id === 0)?.rationale}</p>
          <ul className="mt-3 text-sm">
            {ongoing.map((t) => <li key={t.slug} className="py-1">{alreadyStarted ? <Link href={`/topic/${t.slug}`} className="hover:underline">{t.title}</Link> : t.title}</li>)}
          </ul>
        </li>
      </ol>

      <div className="card text-sm text-mute">
        <p>Aturan main: hari belajar hanya tercatat kalau kamu mengerjakan kuis atau mengunggah bukti kerja. Topik dianggap selesai kalau kuis lulus dan bukti kerja ada. Keduanya wajib.</p>
      </div>
    </div>
  );
}
