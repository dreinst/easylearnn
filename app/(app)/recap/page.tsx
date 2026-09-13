import Link from "next/link";
import { getContent, getProgress } from "@/lib/data";
import { overall, statusMap } from "@/lib/status";
import { formatYmd } from "@/lib/dates";
import QuickView from "@/components/QuickView";
import Icon from "@/components/Icon";
import { recapToMarkdown } from "@/lib/export";
import { markdownToHtml } from "@/lib/mdhtml";

export const metadata = { title: "Recap" };

export default async function RecapPage() {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const summaryHtml = markdownToHtml(recapToMarkdown(content, progress));
  const scored = ordered.filter((t) => statuses[t.slug].best_score != null && t.questions.length);
  const avg = scored.length ? Math.round(scored.reduce((a, t) => a + (statuses[t.slug].best_score! / t.questions.length) * 100, 0) / scored.length) : null;
  const lastAttempt = (slug: string) => {
    const a = progress.quiz_attempts.filter((x) => x.topic === slug).sort((x, y) => (x.attempted_at < y.attempted_at ? 1 : -1))[0];
    return a ? formatYmd(a.attempted_at.slice(0, 10)) : null;
  };
  const code = (t: { week_from: number | null; week_to: number | null }) =>
    t.week_from == null ? "EL" : `M${String(t.week_from).padStart(2, "0")}`;
  const phaseName = (id: number) => {
    const p = content.phases.find((x) => x.id === id);
    return p ? (p.id === 0 ? p.name : `Fase ${p.id}: ${p.name}`) : "";
  };

  const stats = [
    { label: "Kesiapan kurikulum", value: `${sum.percent}%`, caption: `${sum.done} dari ${sum.total} topik selesai`, bar: sum.percent, tone: "bg-mint", icon: "check-circle" as const },
    { label: "Kuis tuntas", value: `${sum.quiz}`, unit: `/ ${sum.total} kuis`, caption: "Lulus kalau benar minimal dua pertiga soal", bar: sum.total ? Math.round((sum.quiz / sum.total) * 100) : 0, tone: "bg-accent", icon: "quiz" as const },
    { label: "Rata-rata skor", value: avg == null ? "-" : `${avg}%`, caption: scored.length ? `Dari ${scored.length} kuis yang sudah dikerjakan` : "Belum ada kuis yang dikerjakan", bar: avg ?? 0, tone: "bg-navy", icon: "target" as const },
    { label: "Hari belajar", value: `${progress.study_days.length}`, unit: "hari", caption: "Tercatat sejak program dimulai", bar: null, tone: "bg-sky", icon: "calendar" as const },
  ];

  return (
    <div className="space-y-6">
      <header className="card relative overflow-hidden lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow bg-mint/10 text-mint-2">Kurikulum event organizing</span>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy lg:text-4xl">Rangkuman belajar &amp; rekap hasil kuis</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-mute">Laporan pencapaian kuis dan tingkat pemahaman seluruh modul, siap dibawa ke uji kompetensi BNSP.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickView
              title="Rangkuman recap"
              html={summaryHtml}
              downloads={[
                { label: "Unduh recap (PDF)", href: "/api/recap/pdf", primary: true },
                { label: "Unduh rangkuman", href: "/api/recap/export" },
              ]}
            />
            <a href="/api/recap/export" className="btn-ghost">Unduh rangkuman</a>
            <a href="/api/recap/pdf" className="btn-accent"><Icon name="download" />Unduh recap lengkap (PDF)</a>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-mute">{st.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-2 text-navy"><Icon name={st.icon} className="h-4 w-4" /></span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-navy">{st.value}</span>
              {st.unit && <span className="text-sm font-bold text-mute">{st.unit}</span>}
            </div>
            <div className="mt-1 text-xs font-semibold text-mute">{st.caption}</div>
            {st.bar != null && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cream-2">
                <div className={`h-full rounded-full ${st.tone}`} style={{ width: `${st.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="card p-0">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-bold text-navy">Matriks rekap kuis</h2>
          <p className="mt-1 text-sm text-mute">Skor terbaik dan status tiap modul, urut sesuai jalur belajar.</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-cream text-left text-[11px] font-bold uppercase tracking-[0.04em] text-mute">
                <th className="px-6 py-3">Kode &amp; nama topik</th>
                <th className="px-4 py-3">Tanggal kuis</th>
                <th className="px-4 py-3">Nilai kuis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ordered.map((t) => {
                const st = statuses[t.slug];
                const date = lastAttempt(t.slug);
                return (
                  <tr key={t.slug} className="transition-colors hover:bg-cream/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${st.quiz_passed ? "bg-mint/10 text-mint-2" : "bg-cream-2 text-mute"}`}>{code(t)}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-navy">{t.title}</div>
                          <div className="text-xs font-semibold text-mute">{phaseName(t.phase_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-mute">{date ?? "-"}</td>
                    <td className="px-4 py-3">
                      {st.best_score != null ? (
                        <span className={`badge ${st.quiz_passed ? "bg-mint/10 text-mint-2" : "bg-amber/15 text-amber-2"}`}>{st.best_score} / {t.questions.length}</span>
                      ) : (
                        <span className="text-xs font-semibold text-mute">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {st.quiz_passed ? <span className="badge-ok"><Icon name="check" className="h-3 w-3" />Lulus</span> : st.attempts ? <span className="badge-warn">Belum lulus</span> : <span className="badge-no">Belum dikerjakan</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/topic/${t.slug}`} className="btn-ghost px-3 py-1.5 text-xs">{st.quiz_passed ? "Lihat topik" : "Kerjakan kuis"}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 text-xs font-semibold text-mute">{ordered.length} modul, {sum.quiz} kuis lulus.</div>
      </section>
    </div>
  );
}
