export const dynamic = "force-dynamic";

import Link from "next/link";
import { getContent, getProgress, getPushPublicKey } from "@/lib/data";
import { weeklyTopics } from "@/lib/timeline";
import RoadmapForm from "@/components/RoadmapForm";
import { todayInTz } from "@/lib/dates";

export const metadata = { title: "Roadmap" };

export default async function RoadmapPage() {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const push = await getPushPublicKey().catch(() => ({ key: "", enabled: false }));
  const s = progress.settings;
  const today = todayInTz(s.timezone);
  const topics = weeklyTopics(content.topics).map((t) => ({ slug: t.slug, title: t.title, phase_id: t.phase_id, week_from: t.week_from!, week_to: t.week_to! }));
  const ongoing = content.topics.filter((t) => t.week_from == null).map((t) => ({ slug: t.slug, title: t.title }));

  return (
    <main className="min-h-screen">
      <div className="bg-navy px-4 py-8 text-white lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="inline-block h-6 w-6 rounded bg-orange" /><span className="font-bold">Production Book</span></div>
            {s.program_start && <Link href="/" className="text-sm text-white/80 hover:text-white">Ke dashboard</Link>}
          </div>
          <h1 className="mt-6 text-2xl font-bold lg:text-3xl">Roadmap 6 fase, {content.program_weeks} minggu</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Program ini menyusun 23 topik kurikulum Enter Event House menjadi enam fase yang mengikuti urutan kerja nyata. Baca alasannya, pilih tanggal mulai, lalu program dimulai. Timeline bisa digeser kapan saja dari pengaturan tanpa kehilangan progres.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
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
        />
      </div>
    </main>
  );
}
