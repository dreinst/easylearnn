import Link from "next/link";
import { getContent } from "@/lib/data";
import { getStartedProgress } from "@/lib/session";
import { formatRange, formatYmd, todayInTz } from "@/lib/dates";
import { ongoingTopics, topicsForWeek, weekEnd, weekOf, weekStart } from "@/lib/timeline";
import { computeStreak, lastSevenDays } from "@/lib/streak";
import { overall, statusMap } from "@/lib/status";
import StreakBadge from "@/components/StreakBadge";

export default async function Dashboard() {
  const [content, progress] = await Promise.all([getContent(), getStartedProgress()]);
  const s = progress.settings;
  const start = s.program_start;
  const today = todayInTz(s.timezone);
  const week = weekOf(start, today, content.program_weeks);
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const days = progress.study_days.map((d) => d.day);
  const streak = computeStreak(days, today);
  const seven = lastSevenDays(days, today);
  const weekTopics = week >= 1 && week <= content.program_weeks ? topicsForWeek(content.topics, week) : [];
  const phase = week >= 1 && week <= content.program_weeks ? content.phases.find((p) => p.week_from! <= week && week <= p.week_to!) : null;
  const studiedToday = progress.study_days.find((d) => d.day === today);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg bg-navy p-5 text-white">
        <div className="text-xs uppercase tracking-wider text-white/60">{s.display_name ? `Halo, ${s.display_name}` : "Hari ini"}</div>
        <div className="mt-1 text-xl font-bold">{formatYmd(today, true)}</div>
        <div className="mt-1 text-sm text-white/80">
          {week === 0 && <>Program mulai {formatYmd(start, true)}. Gunakan waktu ini untuk membaca roadmap.</>}
          {week >= 1 && week <= content.program_weeks && <>Minggu {week} dari {content.program_weeks} · Fase {phase?.id} {phase?.name}</>}
          {week > content.program_weeks && <>Program 24 minggu sudah lewat. Rapikan portofolio dan ulangi topik yang belum selesai.</>}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${studiedToday ? "bg-emerald-400" : "bg-orange"}`} />
          {studiedToday ? `Hari ini sudah tercatat (${studiedToday.trigger === "quiz" ? "kuis" : "bukti kerja"}).` : "Hari ini belum tercatat. Kerjakan kuis atau unggah bukti kerja."}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <StreakBadge streak={streak} days={seven} />
        <div className="card">
          <div className="label">Progres program</div>
          <div className="text-2xl font-bold text-navy">{sum.done} <span className="text-base font-normal text-mute">dari {sum.total} topik selesai</span></div>
          <div className="mt-2 h-2 w-full rounded bg-line"><div className="h-2 rounded bg-orange" style={{ width: `${sum.percent}%` }} /></div>
          <div className="mt-2 flex gap-4 text-xs text-mute">
            <span>Kuis lulus: {sum.quiz}</span>
            <span>Bukti kerja: {sum.evidence}</span>
          </div>
        </div>
      </div>

      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-navy">Minggu ini</h2>
          {week >= 1 && week <= content.program_weeks && (
            <span className="font-mono text-xs text-mute">{formatRange(weekStart(start, week), weekEnd(start, week))}</span>
          )}
        </div>
        {weekTopics.length === 0 && <p className="mt-2 text-sm text-mute">Tidak ada topik mingguan untuk saat ini.</p>}
        {weekTopics.map((t) => {
          const st = statuses[t.slug];
          return (
            <div key={t.slug} className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-line p-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-mute">{t.curriculum_ref} · minggu {t.week_from}{t.week_to !== t.week_from ? ` sampai ${t.week_to}` : ""}</div>
                <div className="font-semibold text-navy">{t.title}</div>
                <p className="mt-1 text-sm text-mute">{t.summary}</p>
                <div className="mt-2 flex gap-2">
                  <span className={st.quiz_passed ? "badge-ok" : "badge-no"}>Kuis {st.quiz_passed ? "lulus" : "belum"}</span>
                  <span className={st.evidence_done ? "badge-ok" : "badge-no"}>Bukti kerja {st.evidence_done ? "ada" : "belum"}</span>
                </div>
              </div>
              <Link href={`/topic/${t.slug}`} className="btn-orange">Buka topik</Link>
            </div>
          );
        })}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-navy">Sepanjang program</h2>
        <p className="text-sm text-mute">Tiga kebiasaan personal yang dibuktikan lewat pekerjaan nyata di tiap fase.</p>
        <ul className="mt-3 divide-y divide-line">
          {ongoingTopics(content.topics).map((t) => {
            const st = statuses[t.slug];
            return (
              <li key={t.slug} className="flex items-center gap-3 py-2">
                <Link href={`/topic/${t.slug}`} className="min-w-0 flex-1 font-medium text-navy hover:underline">{t.title}</Link>
                <span className={st.quiz_passed ? "badge-ok" : "badge-no"}>K</span>
                <span className={st.evidence_done ? "badge-ok" : "badge-no"}>B</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
