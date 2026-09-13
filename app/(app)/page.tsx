import Link from "next/link";
import { getContent } from "@/lib/data";
import { getStartedProgress } from "@/lib/session";
import { addDays, diffDays, formatRange, formatYmd, timeInTz, todayInTz } from "@/lib/dates";
import { ongoingTopics, topicsForWeek, weekEnd, weekOf, weekStart } from "@/lib/timeline";
import { computeStreak } from "@/lib/streak";
import { overall, statusMap } from "@/lib/status";
import { currentModule, lockInfo } from "@/lib/progression";
import { passMark } from "@/lib/quiz";
import Icon, { type IconName } from "@/components/Icon";

function StatCard({ label, icon, caption, bar, tone, children }: { label: string; icon: IconName; caption: string; bar: number | null; tone: string; children: React.ReactNode }) {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-mute">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-2 text-navy"><Icon name={icon} className="h-4 w-4" /></span>
      </div>
      <div className="mt-4">{children}</div>
      <div className="mt-1 text-xs font-semibold text-mute">{caption}</div>
      {bar != null && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cream-2">
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
    </div>
  );
}

export default async function Dashboard() {
  const [content, progress] = await Promise.all([getContent(), getStartedProgress()]);
  const s = progress.settings;
  const start = s.program_start;
  const today = todayInTz(s.timezone);
  const week = weekOf(start, today, content.program_weeks);
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const days = progress.study_days.map((d) => d.day);
  const daySet = new Set(days);
  const streak = computeStreak(days, today);
  const inProgram = week >= 1 && week <= content.program_weeks;
  const weekTopics = inProgram ? topicsForWeek(content.topics, week) : [];
  const phase = inProgram ? content.phases.find((p) => p.week_from! <= week && week <= p.week_to!) : null;
  const studiedToday = daySet.has(today);
  const current = currentModule(content, statuses);
  const currentStatus = current ? statuses[current.slug] : null;
  const currentPhase = current ? content.phases.find((p) => p.id === current.phase_id) : null;
  const daysLeft = Math.max(0, diffDays(today, weekEnd(start, content.program_weeks)));
  const scored = content.topics.filter((t) => statuses[t.slug].best_score != null && t.questions.length);
  const avg = scored.length ? Math.round(scored.reduce((a, t) => a + (statuses[t.slug].best_score! / t.questions.length) * 100, 0) / scored.length) : null;
  const bySlug = Object.fromEntries(content.topics.map((t) => [t.slug, t]));
  const recent = [...progress.quiz_attempts].sort((a, b) => (a.attempted_at < b.attempted_at ? 1 : -1)).slice(0, 5);
  const heat = Array.from({ length: 28 }, (_, i) => {
    const day = addDays(today, -(27 - i));
    return { day, studied: daySet.has(day), isToday: day === today };
  });
  const activeDays = heat.filter((h) => h.studied).length;
  const code = (t: { week_from: number | null }) => (t.week_from == null ? "EL" : `M${String(t.week_from).padStart(2, "0")}`);
  const phaseName = (id: number) => {
    const p = content.phases.find((x) => x.id === id);
    return p ? (p.id === 0 ? p.name : `Fase ${p.id}: ${p.name}`) : "";
  };
  const name = s.display_name.trim();
  const RING = 2 * Math.PI * 34;

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow bg-accent/10 text-accent"><Icon name="fire" className="h-3.5 w-3.5" />{streak.count} hari beruntun</span>
              <span className="eyebrow bg-cream-2 text-navy"><Icon name="flag" className="h-3.5 w-3.5" />Target selesai: {daysLeft} hari lagi</span>
              {phase && <span className="eyebrow bg-mint/10 text-mint-2">Fase {phase.id} aktif</span>}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-navy lg:text-4xl">{name ? `Halo, ${name}!` : "Halo!"}</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-mute">
              {week === 0 && `Program mulai ${formatYmd(start, true)}. Gunakan waktu ini untuk membaca roadmap.`}
              {inProgram && `Minggu ${week} dari ${content.program_weeks}. Selesaikan kuis pemahaman dan tinjau rangkuman mingguanmu.`}
              {week > content.program_weeks && `Program ${content.program_weeks} minggu sudah lewat. Ulangi topik yang belum selesai.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-mute">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${studiedToday ? "bg-mint" : "bg-accent"}`} />
                {studiedToday ? "Hari ini sudah tercatat (kuis)." : "Hari ini belum tercatat. Kerjakan kuis hari ini."}
              </span>
              <span className="flex items-center gap-1.5"><Icon name="calendar" className="h-3.5 w-3.5" />{formatYmd(today, true)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-cream p-5 lg:min-w-[280px]">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-cream-2" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={avg != null && avg >= 67 ? "text-mint" : "text-accent"} strokeDasharray={`${((avg ?? 0) / 100) * RING} ${RING}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-navy">{avg == null ? "-" : avg}</span>
                {avg != null && <span className="text-[9px] font-bold uppercase tracking-[0.04em] text-mute">skor rata</span>}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-mute">Rata-rata skor kuis</div>
              <div className="mt-1 text-sm font-bold text-navy">{avg == null ? "Belum ada kuis" : avg >= 67 ? "Di atas ambang lulus" : "Di bawah ambang lulus"}</div>
              <div className="text-xs font-semibold text-mute">Lulus kalau benar minimal dua pertiga soal</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Progres kurikulum" icon="book" caption="Topik yang sudah selesai" bar={sum.percent} tone="bg-mint">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-navy">{sum.done}</span>
            <span className="text-sm font-bold text-mute">/ {sum.total}</span>
            <span className="badge-ok">{sum.percent}%</span>
          </div>
        </StatCard>
        <StatCard label="Kuis lulus" icon="quiz" caption={`Dari ${sum.total} kuis pemahaman`} bar={sum.total ? (sum.quiz / sum.total) * 100 : 0} tone="bg-accent">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-navy">{sum.quiz}</span>
            <span className="text-sm font-bold text-mute">kuis</span>
          </div>
        </StatCard>
        <StatCard label="Hari belajar" icon="calendar" caption={streak.count ? `Beruntun ${streak.count} hari` : "Kerjakan kuis untuk mulai beruntun"} bar={null} tone="bg-navy">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-navy">{days.length}</span>
            <span className="text-sm font-bold text-mute">hari</span>
          </div>
        </StatCard>
        <StatCard label="Target pekan ini" icon="flag" caption={inProgram ? formatRange(weekStart(start, week), weekEnd(start, week)) : "Di luar jadwal program"} bar={null} tone="bg-sky">
          {inProgram && weekTopics[0] ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-md bg-navy px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">M{String(week).padStart(2, "0")}</span>
              <span className="line-clamp-2 text-sm font-bold leading-snug text-navy">{weekTopics[0].title}</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-navy">Tidak ada topik mingguan</span>
          )}
        </StatCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card xl:col-span-2 xl:self-start lg:p-8">
          {current && currentStatus ? (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="eyebrow bg-accent/10 text-accent">Modul aktif</span>
                <span className="eyebrow bg-cream-2 text-navy">{code(current)}</span>
                {currentPhase && <span className="eyebrow bg-cream-2 text-mute">Fase {currentPhase.id}: {currentPhase.name}</span>}
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-navy lg:text-3xl">{current.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">{current.summary}</p>
              <div className="mt-5 space-y-2 rounded-2xl bg-cream p-4">
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon name="quiz" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-navy">Kuis pemahaman ({current.questions.length} soal)</div>
                    <div className="text-xs font-semibold text-mute">Lulus kalau benar minimal {passMark(current.questions.length)} soal, boleh diulang</div>
                  </div>
                  {currentStatus.quiz_passed ? (
                    <span className="badge-ok">Lulus {currentStatus.best_score}/{current.questions.length}</span>
                  ) : currentStatus.attempts ? (
                    <span className="badge-warn">Belum lulus ({currentStatus.best_score}/{current.questions.length})</span>
                  ) : (
                    <span className="badge-no">Belum dikerjakan</span>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint-2"><Icon name="book" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-navy">Rangkuman dan unduhan</div>
                    <div className="text-xs font-semibold text-mute">Terbuka setelah kuis topik ini lulus</div>
                  </div>
                  {currentStatus.quiz_passed ? <span className="badge-ok">Tersedia</span> : <span className="badge-no">Terkunci</span>}
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-mute">Modul berikutnya terbuka setelah kuis lulus.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/topic/${current.slug}`} className="btn-accent">Buka topik &amp; kerjakan kuis<Icon name="arrow-right" /></Link>
                <Link href="/roadmap" className="btn-ghost">Lihat roadmap</Link>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow bg-mint/10 text-mint-2">Semua modul mingguan selesai</span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy">Kuis semua topik sudah lulus</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">Buka recap untuk melihat rangkuman skor dan mengunduh laporan lengkapnya.</p>
              <div className="mt-5"><Link href="/recap" className="btn-accent">Buka recap<Icon name="arrow-right" /></Link></div>
            </>
          )}
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold text-navy">Minggu ini</h3>
              {inProgram && <span className="font-mono text-[11px] font-bold text-mute">M{String(week).padStart(2, "0")}</span>}
            </div>
            {weekTopics.length === 0 && <p className="mt-2 text-sm font-semibold text-mute">Tidak ada topik mingguan untuk saat ini.</p>}
            <ul className="mt-2 space-y-2">
              {weekTopics.map((t) => {
                const st = statuses[t.slug];
                const lock = lockInfo(content, statuses, t.slug);
                const href = lock.locked && lock.blocker ? `/topic/${lock.blocker.slug}` : `/topic/${t.slug}`;
                return (
                  <li key={t.slug}>
                    <Link href={href} className="flex items-center gap-3 rounded-xl border border-navy/8 bg-cream/60 p-3 transition-colors hover:bg-white">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${st.quiz_passed ? "bg-mint/10 text-mint-2" : lock.locked ? "bg-cream-2 text-mute" : "bg-accent/10 text-accent"}`}>
                        <Icon name={st.quiz_passed ? "check" : lock.locked ? "lock" : "arrow-right"} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-navy">{t.title}</div>
                        <div className="text-[11px] font-semibold text-mute">{lock.locked && lock.blocker ? `Terkunci, selesaikan dulu ${lock.blocker.title}` : st.quiz_passed ? "Kuis lulus" : "Kuis belum lulus"}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">Ritme belajar</h3>
                <div className="text-xs font-semibold text-mute">4 minggu terakhir</div>
              </div>
              <span className={activeDays >= 8 ? "badge-ok" : "badge-no"}>{activeDays} hari aktif</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {heat.map((h) => (
                <span
                  key={h.day}
                  title={`${formatYmd(h.day)}: ${h.studied ? "belajar" : "tidak"}`}
                  className={`h-6 rounded-md ${h.studied ? "bg-mint" : "bg-cream-2"} ${h.isToday ? "ring-2 ring-accent ring-offset-1" : ""}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.04em] text-mute">
              <span>Hari belajar</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-mint" />Kuis dikerjakan</span>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber-2"><Icon name="bell" className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-navy">Pengingat harian</h3>
                <div className="text-xs font-semibold text-mute">Pukul {s.remind_time} ({s.timezone})</div>
                <p className="mt-2 text-xs font-semibold text-mute">
                  {progress.push_subscriptions.length ? `Notifikasi aktif di ${progress.push_subscriptions.length} perangkat, dikirim kalau hari itu belum kuis.` : "Belum ada perangkat yang diaktifkan untuk notifikasi."}
                </p>
                <Link href="/settings" className="btn-ghost mt-3 px-3 py-1.5 text-xs">Atur pengingat</Link>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h3 className="text-base font-bold text-navy">Sepanjang program</h3>
            <p className="text-xs font-semibold text-mute">Tiga kebiasaan personal yang dilatih terus lewat kuis di tiap fase.</p>
            <ul className="mt-3 divide-y divide-line">
              {ongoingTopics(content.topics).map((t) => {
                const st = statuses[t.slug];
                return (
                  <li key={t.slug} className="flex items-center gap-3 py-2">
                    <Link href={`/topic/${t.slug}`} className="min-w-0 flex-1 truncate text-sm font-bold text-navy hover:underline">{t.title}</Link>
                    {st.quiz_passed ? <span className="badge-ok"><Icon name="check" className="h-3 w-3" />Lulus</span> : <span className="badge-no">Belum</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <section className="card p-0">
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-6">
          <div>
            <h2 className="text-xl font-bold text-navy">Rekap kuis terbaru</h2>
            <p className="mt-1 text-sm text-mute">Lima percobaan kuis terakhir.</p>
          </div>
          <Link href="/recap" className="btn-ghost px-3 py-1.5 text-xs">Semua modul ({sum.total})<Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" /></Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-6 text-sm font-semibold text-mute">Belum ada kuis yang dikerjakan.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-cream text-left text-[11px] font-bold uppercase tracking-[0.04em] text-mute">
                  <th className="px-6 py-3">Modul &amp; topik</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Skor kuis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((a) => {
                  const t = bySlug[a.topic];
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-cream/60">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-cream-2 font-mono text-xs font-bold text-navy">{t ? code(t) : "-"}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-navy">{t?.title ?? a.topic}</div>
                            {t && <div className="text-xs font-semibold text-mute">{phaseName(t.phase_id)}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-mute">{formatYmd(a.attempted_at.slice(0, 10))}, {timeInTz(s.timezone, new Date(a.attempted_at))}</td>
                      <td className="px-4 py-3"><span className={`badge ${a.passed ? "bg-mint/10 text-mint-2" : "bg-amber/15 text-amber-2"}`}>{a.score} / {a.total}</span></td>
                      <td className="px-4 py-3">{a.passed ? <span className="badge-ok"><Icon name="check" className="h-3 w-3" />Lulus</span> : <span className="badge-warn">Belum lulus</span>}</td>
                      <td className="px-6 py-3 text-right"><Link href={`/topic/${a.topic}`} className="btn-ghost px-3 py-1.5 text-xs"><Icon name="eye" className="h-3.5 w-3.5" />Buka topik</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
