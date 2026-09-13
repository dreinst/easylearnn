export const dynamic = "force-dynamic";

import { getContent, getProgress, getPushPublicKey } from "@/lib/data";
import { weeklyTopics } from "@/lib/timeline";
import { statusMap } from "@/lib/status";
import { lockedSlugs } from "@/lib/progression";
import RoadmapForm from "@/components/RoadmapForm";
import BrandNav from "@/components/BrandNav";
import { Aura, Footer } from "@/components/AppShell";
import { todayInTz } from "@/lib/dates";

export const metadata = { title: "Roadmap" };

export default async function RoadmapPage() {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const push = await getPushPublicKey().catch(() => ({ key: "", enabled: false }));
  const s = progress.settings;
  const today = todayInTz(s.timezone);
  const topics = weeklyTopics(content.topics).map((t) => ({ slug: t.slug, title: t.title, phase_id: t.phase_id, week_from: t.week_from!, week_to: t.week_to! }));
  const ongoing = content.topics.filter((t) => t.week_from == null).map((t) => ({ slug: t.slug, title: t.title }));
  const statuses = statusMap(content, progress);
  const locked = [...lockedSlugs(content, statuses)];

  return (
    <div className="relative min-h-screen">
      <Aura />
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/80 shadow-[0_1px_8px_rgb(0_0_0/0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 lg:px-8"><BrandNav /></div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-24 lg:px-8">
        <section className="mb-8 max-w-3xl">
          <span className="eyebrow bg-accent/10 text-accent">Kurikulum standar industri EO</span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy lg:text-[40px] lg:leading-[48px]">
            Peta perjalanan belajar {content.program_weeks} minggu
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-mute">
            23 topik kurikulum Enter Event House disusun jadi enam fase yang mengikuti urutan kerja nyata. Pilih tanggal mulai, lalu program berjalan. Timeline bisa digeser kapan saja dari pengaturan tanpa kehilangan progres.
          </p>
        </section>
        <RoadmapForm
          phases={content.phases}
          topics={topics}
          ongoing={ongoing}
          initialStart={s.program_start ?? today}
          initialRemind={s.remind_time}
          initialTz={s.timezone}
          alreadyStarted={Boolean(s.program_start)}
          pushKey={push.key}
          pushEnabled={push.enabled}
          totalWeeks={content.program_weeks}
          statuses={statuses}
          locked={locked}
        />
      </main>
      <Footer />
    </div>
  );
}
