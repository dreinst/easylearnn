"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, TopicStatus } from "@/lib/types";
import { formatYmd } from "@/lib/dates";
import Icon from "@/components/Icon";
import { NavPills } from "@/components/BrandNav";

type Row = { week: number; from: string; to: string; phase_id: number | null; topics: { slug: string; title: string; week_from: number | null }[] };

export default function Sidebar({
  phases, rows, ongoing, statuses, currentWeek, summary, locked,
}: {
  phases: Phase[];
  rows: Row[];
  ongoing: { slug: string; title: string }[];
  statuses: Record<string, TopicStatus>;
  currentWeek: number;
  summary: { total: number; done: number; percent: number };
  locked: string[];
}) {
  const lockedSet = new Set(locked);
  const pathname = usePathname();
  const weekly = phases.filter((p) => p.id !== 0);
  const shortDate = (ymd: string) => (ymd ? formatYmd(ymd).replace(/ \d{4}$/, "") : "");

  const [open, setOpen] = useState<Set<number>>(() => {
    const s = new Set<number>();
    for (const r of rows) {
      const t = r.topics[0];
      if (r.phase_id != null && (r.week === currentWeek || (t && pathname === `/topic/${t.slug}`))) s.add(r.phase_id);
    }
    return s;
  });
  const toggle = (id: number) => setOpen((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="flex flex-col p-5">
      <div className="lg:hidden">
        <NavPills vertical />
        <div className="my-4 border-t border-line" />
      </div>

      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-bold text-navy">Silabus {rows.length} minggu</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-mint-2">{summary.percent}% selesai</span>
        </div>
        <div className="mb-2 text-xs font-semibold text-mute">{summary.done} dari {summary.total} topik selesai</div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-2">
          <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${summary.percent}%` }} />
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {weekly.map((p) => {
          const phaseRows = rows.filter((r) => r.phase_id === p.id);
          const slugs = [...new Set(phaseRows.flatMap((r) => r.topics.map((t) => t.slug)))];
          const allDone = slugs.length > 0 && slugs.every((s) => statuses[s]?.done);
          const allLocked = slugs.length > 0 && slugs.every((s) => lockedSet.has(s));
          const isCurrent = phaseRows.some((r) => r.week === currentWeek);
          const isOpen = open.has(p.id);
          return (
            <div key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-cream-2 ${isOpen ? "bg-cream-2/60" : ""}`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-navy">Fase {p.id}: {p.name}</div>
                  <div className="text-xs font-semibold text-mute">Minggu {p.week_from}-{p.week_to}</div>
                </div>
                {allDone ? (
                  <Icon name="check-circle" className="h-5 w-5 shrink-0 text-mint" />
                ) : isCurrent ? (
                  <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-accent" />
                ) : allLocked ? (
                  <Icon name="lock" className="h-4 w-4 shrink-0 text-mute" />
                ) : (
                  <Icon name="chevron" className={`h-4 w-4 shrink-0 text-mute transition-transform ${isOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {isOpen && (
                <div className="mb-2 mt-1 flex flex-col gap-0.5 pl-2">
                  {phaseRows.map((r) => {
                    const t = r.topics[0];
                    const st = t ? statuses[t.slug] : undefined;
                    const active = r.week === currentWeek;
                    const href = t ? `/topic/${t.slug}` : "#";
                    const selected = t && pathname === href;
                    const continuation = t && t.week_from !== r.week;
                    const isLocked = t ? lockedSet.has(t.slug) : false;
                    return (
                      <Link
                        key={r.week}
                        href={href}
                        title={isLocked ? "Terkunci: selesaikan modul sebelumnya" : undefined}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-tight transition-colors ${
                          active ? "bg-accent/8" : selected ? "bg-cream-2" : "hover:bg-cream-2"
                        } ${isLocked ? "opacity-50" : ""}`}
                      >
                        <span className={`w-8 shrink-0 font-mono text-[11px] ${active ? "font-bold text-accent" : "text-mute"}`}>M{String(r.week).padStart(2, "0")}</span>
                        <span className="w-[52px] shrink-0 font-mono text-[10px] text-mute">{shortDate(r.from)}</span>
                        <span className={`min-w-0 flex-1 truncate font-semibold ${continuation ? "italic text-mute" : "text-ink"}`}>
                          {t ? t.title : "Tanpa topik"}{continuation ? " (lanjutan)" : ""}
                        </span>
                        {isLocked ? (
                          <Icon name="lock" className="h-3 w-3 shrink-0 text-mute" />
                        ) : st?.quiz_passed ? (
                          <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-mint" />
                        ) : (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-line" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.04em] text-mute">Sepanjang program</div>
        {ongoing.map((t) => {
          const st = statuses[t.slug];
          const href = `/topic/${t.slug}`;
          return (
            <Link key={t.slug} href={href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${pathname === href ? "bg-cream-2" : "hover:bg-cream-2"}`}>
              <span className="min-w-0 flex-1 truncate text-ink">{t.title}</span>
              {st?.quiz_passed ? <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-mint" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-line" />}
            </Link>
          );
        })}
      </div>
      <div className="mt-4 px-3 text-[11px] font-semibold text-mute">Centang hijau: kuis sudah lulus. Gembok: terkunci sampai modul sebelumnya selesai.</div>
    </div>
  );
}
