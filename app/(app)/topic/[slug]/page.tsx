import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/data";
import { getStartedProgress } from "@/lib/session";
import { findTopic, topicStatus } from "@/lib/status";
import { stripAnswers } from "@/lib/quiz";
import { formatRange, todayInTz } from "@/lib/dates";
import { weekEnd, weekStart } from "@/lib/timeline";
import Quiz from "@/components/Quiz";
import EvidenceForm from "@/components/EvidenceForm";
import EvidenceList from "@/components/EvidenceList";
import SourceList from "@/components/SourceList";
import QuickView from "@/components/QuickView";
import { topicToMarkdown } from "@/lib/export";
import { markdownToHtml } from "@/lib/mdhtml";
import { lockInfo } from "@/lib/progression";
import { statusMap } from "@/lib/status";
import LockedTopic from "@/components/LockedTopic";
import ReadingGate from "@/components/ReadingGate";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const t = findTopic(content, slug);
  return { title: t ? t.title : "Topik" };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, progress] = await Promise.all([getContent(), getStartedProgress()]);
  const topic = findTopic(content, slug);
  if (!topic) notFound();
  const st = topicStatus(progress, slug);
  const statuses = statusMap(content, progress);
  const lock = lockInfo(content, statuses, slug);
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const start = progress.settings.program_start;
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const idx = ordered.findIndex((t) => t.slug === slug);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const evidence = progress.evidence.filter((e) => e.topic === slug).sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
  const attempts = progress.quiz_attempts.filter((a) => a.topic === slug);
  const today = todayInTz(progress.settings.timezone);
  const summaryHtml = markdownToHtml(topicToMarkdown(topic, content, progress));
  const readingText = [topic.summary, ...topic.points, topic.evidence_brief, ...topic.units.map((u) => u.unit_name), ...topic.university.map((m) => `${m.module} ${m.institution}`), ...topic.sources.map((x) => `${x.title} ${x.description}`)].join(" ");
  const words = readingText.split(/\s+/).filter(Boolean).length;

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <header className="card">
        <div className="flex flex-wrap items-center gap-2 text-xs text-mute">
          <span className="badge-orange">{topic.curriculum_ref}</span>
          {phase && <span>Fase {phase.id} · {phase.name}</span>}
          {topic.week_from ? (
            <span className="font-mono">Minggu {topic.week_from}{topic.week_to !== topic.week_from ? ` sampai ${topic.week_to}` : ""} · {formatRange(weekStart(start, topic.week_from), weekEnd(start, topic.week_to!))}</span>
          ) : (
            <span>Sepanjang program</span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold text-navy">{topic.title}</h1>
        <p className="mt-2 text-sm leading-relaxed">{topic.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={st.quiz_passed ? "badge-ok" : "badge-no"}>Kuis {st.quiz_passed ? "lulus" : "belum lulus"}{st.best_score != null ? ` (terbaik ${st.best_score}/${topic.questions.length})` : ""}</span>
          <span className={st.evidence_done ? "badge-ok" : "badge-no"}>Bukti kerja {st.evidence_done ? `${evidence.length} berkas` : "belum ada"}</span>
          {lock.locked ? <span className="badge-warn">Terkunci</span> : <span className={st.done ? "badge-ok" : "badge-warn"}>{st.done ? "Topik selesai" : "Belum selesai: perlu kuis lulus dan bukti kerja"}</span>}
        </div>
      </header>

      {lock.locked && lock.blocker && (
        <LockedTopic
          title={topic.title}
          blockerSlug={lock.blocker.slug}
          blockerTitle={lock.blocker.title}
          quizPassed={statuses[lock.blocker.slug].quiz_passed}
          evidenceDone={statuses[lock.blocker.slug].evidence_done}
        />
      )}

      {!lock.locked && (<>
      <section className="card" id="acuan">
        <h2 className="text-lg font-semibold text-navy">Acuan</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <div className="label">Unit kompetensi AQF (SIT50322)</div>
            <ul className="space-y-2 text-sm">
              {topic.units.map((u) => (
                <li key={u.unit_code}>
                  <a href={u.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-orange-2 hover:underline">{u.unit_code}</a>
                  <span className="ml-1">{u.unit_name}</span>
                  {u.is_core && <span className="badge-orange ml-1">inti</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label">Modul kampus pembanding</div>
            <ul className="space-y-2 text-sm">
              {topic.university.map((m, i) => (
                <li key={i}>
                  <span className="font-medium">{m.module}</span>
                  <div className="text-xs text-mute"><a href={m.url} target="_blank" rel="noreferrer" className="hover:underline">{m.institution}</a> · {m.programme}{m.catalogue ? ` · ${m.catalogue}` : ""}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card" id="materi">
        <h2 className="text-lg font-semibold text-navy">Inti materi</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {topic.points.map((p, i) => <li key={i}>{p}</li>)}
        </ol>
        <p className="mt-4 text-xs text-mute">Bingung di bagian tertentu? Tanya AI lewat tombol di kanan bawah. Ia tahu isi topik ini.</p>
      </section>

      <section className="card" id="bukti">
        <h2 className="text-lg font-semibold text-navy">Bukti kerja</h2>
        <p className="mt-2 text-sm leading-relaxed">{topic.evidence_brief}</p>
        <EvidenceList items={evidence} />
        <EvidenceForm slug={slug} />
      </section>

      <section className="card" id="sumber">
        <h2 className="text-lg font-semibold text-navy">Sumber</h2>
        <p className="mt-1 text-xs text-mute">Tombol Preview hanya muncul untuk situs yang mengizinkan ditampilkan di dalam halaman. Sisanya dibuka di tab baru.</p>
        <SourceList sources={topic.sources} />
      </section>

      <section className="card" id="kuis">
        <h2 className="text-lg font-semibold text-navy">Kuis</h2>
        <p className="mt-1 text-xs text-mute">{topic.questions.length} soal, lulus kalau benar minimal {Math.ceil((topic.questions.length * 2) / 3)}. Boleh diulang. Setiap pengerjaan mencatat hari belajar ({today}).</p>
        <ReadingGate slug={slug} words={words} alreadyPassed={st.quiz_passed}>
          <Quiz slug={slug} questions={stripAnswers(topic.questions)} attempts={attempts.length} />
        </ReadingGate>
      </section>

      <section className="card" id="rangkuman">
        <h2 className="text-lg font-semibold text-navy">Rangkuman dan unduhan</h2>
        {st.quiz_passed ? (
          <>
            <p className="mt-1 text-sm text-mute">Kuis sudah lulus. Rangkuman ini menandai kamu sudah menuntaskan materi topik ini; jurnal bukti kerjamu ikut di dalamnya.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuickView
                title={`Rangkuman: ${topic.title}`}
                html={summaryHtml}
                downloads={[
                  { label: "Unduh PDF (materi + jurnal)", href: `/api/topic/${slug}/pdf`, primary: true },
                  { label: "Unduh rangkuman", href: `/api/topic/${slug}/export` },
                ]}
              />
              <a href={`/api/topic/${slug}/pdf`} className="btn-navy text-xs">Unduh PDF</a>
              <a href={`/api/topic/${slug}/export`} className="btn-ghost text-xs">Unduh rangkuman</a>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-mute">Rangkuman dan unduhan terbuka setelah kuis topik ini lulus.</p>
        )}
      </section>
      </>)}

      <nav className="flex justify-between text-sm">
        {prev ? <Link href={`/topic/${prev.slug}`} className="btn-ghost">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/topic/${next.slug}`} className="btn-ghost">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
