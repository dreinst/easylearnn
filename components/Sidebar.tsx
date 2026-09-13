"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, TopicStatus } from "@/lib/types";
import { formatYmd } from "@/lib/dates";

type Row = { week: number; from: string; to: string; phase_id: number | null; topics: { slug: string; title: string; week_from: number | null }[] };

export default function Sidebar({
  phases, rows, ongoing, statuses, currentWeek, summary,
}: {
  phases: Phase[];
  rows: Row[];
  ongoing: { slug: string; title: string }[];
  statuses: Record<string, TopicStatus>;
  currentWeek: number;
  summary: { total: number; done: number; percent: number };
}) {
  const pathname = usePathname();
  const nav = [
    { href: "/", label: "Dashboard" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/settings", label: "Pengaturan" },
  ];
  const shortDate = (ymd: string) => (ymd ? formatYmd(ymd).replace(/ \d{4}$/, "") : "");

  return (
    <div className="flex flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded bg-orange" />
          <span className="text-base font-bold tracking-wide">Production Book</span>
        </Link>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-white/60">
            <span>Progres</span>
            <span>{summary.done}/{summary.total} topik</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded bg-white/15">
            <div className="h-1.5 rounded bg-orange" style={{ width: `${summary.percent}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 px-3 py-3 text-sm">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded px-2.5 py-1 ${pathname === n.href ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <div className="mb-1 px-2 text-[11px] uppercase tracking-wider text-white/50">Rundown 24 minggu</div>
        {phases.filter((p) => p.id !== 0).map((p) => (
          <div key={p.id} className="mb-2">
            <div className="flex items-baseline justify-between px-2 pt-2 pb-1">
              <span className="text-xs font-bold uppercase tracking-wide text-orange">Fase {p.id} · {p.name}</span>
              <span className="font-mono text-[10px] text-white/50">M{p.week_from}-{p.week_to}</span>
            </div>
            {rows.filter((r) => r.phase_id === p.id).map((r) => {
              const t = r.topics[0];
              const st = t ? statuses[t.slug] : undefined;
              const active = r.week === currentWeek;
              const href = t ? `/topic/${t.slug}` : "#";
              const selected = t && pathname === href;
              const continuation = t && t.week_from !== r.week;
              return (
                <Link
                  key={r.week}
                  href={href}
                  className={`group flex items-center gap-2 rounded px-2 py-1.5 text-[13px] leading-tight ${
                    active ? "bg-orange/20 ring-1 ring-orange/60" : selected ? "bg-white/10" : "hover:bg-white/10"
                  }`}
                >
                  <span className={`w-8 shrink-0 font-mono text-[11px] ${active ? "text-orange" : "text-white/50"}`}>M{String(r.week).padStart(2, "0")}</span>
                  <span className="w-[62px] shrink-0 font-mono text-[10px] text-white/50">{shortDate(r.from)}</span>
                  <span className={`min-w-0 flex-1 truncate ${continuation ? "text-white/60 italic" : "text-white/90"}`}>
                    {t ? t.title : "Tanpa topik"}{continuation ? " (lanjutan)" : ""}
                  </span>
                  {st && (
                    <span className="flex shrink-0 gap-0.5" title={`Kuis ${st.quiz_passed ? "lulus" : "belum"}, bukti ${st.evidence_done ? "ada" : "belum"}`}>
                      <span className={`h-2 w-2 rounded-sm ${st.quiz_passed ? "bg-emerald-400" : "bg-white/20"}`} />
                      <span className={`h-2 w-2 rounded-sm ${st.evidence_done ? "bg-emerald-400" : "bg-white/20"}`} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-orange">Sepanjang program</div>
          {ongoing.map((t) => {
            const st = statuses[t.slug];
            const href = `/topic/${t.slug}`;
            return (
              <Link key={t.slug} href={href} className={`flex items-center gap-2 rounded px-2 py-1.5 text-[13px] ${pathname === href ? "bg-white/10" : "hover:bg-white/10"}`}>
                <span className="w-8 shrink-0 font-mono text-[11px] text-white/50">PB</span>
                <span className="min-w-0 flex-1 truncate text-white/90">{t.title}</span>
                {st && (
                  <span className="flex shrink-0 gap-0.5">
                    <span className={`h-2 w-2 rounded-sm ${st.quiz_passed ? "bg-emerald-400" : "bg-white/20"}`} />
                    <span className={`h-2 w-2 rounded-sm ${st.evidence_done ? "bg-emerald-400" : "bg-white/20"}`} />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 px-2 text-[10px] text-white/40">Kotak hijau: kiri = kuis lulus, kanan = bukti kerja ada.</div>
      </div>
    </div>
  );
}
