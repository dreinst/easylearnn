export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getContent, getProgress } from "@/lib/data";
import { todayInTz } from "@/lib/dates";
import { buildRundown, ongoingTopics, weekOf } from "@/lib/timeline";
import { computeStreak } from "@/lib/streak";
import { overall, statusMap } from "@/lib/status";
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";
import StreakBadge from "@/components/StreakBadge";
import Chatbot from "@/components/Chatbot";
import { lockedSlugs } from "@/lib/progression";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const s = progress.settings;
  if (!s.program_start) redirect("/roadmap");

  const today = todayInTz(s.timezone);
  const week = weekOf(s.program_start, today, content.program_weeks);
  const statuses = statusMap(content, progress);
  const streak = computeStreak(progress.study_days.map((d) => d.day), today);
  const rundown = buildRundown(s.program_start, content.phases, content.topics, content.program_weeks);
  const sum = overall(content, statuses);
  const locked = [...lockedSlugs(content, statuses)];

  const sidebar = (
    <Sidebar
      phases={content.phases}
      rows={rundown.map((r) => ({ ...r, topics: r.topics.map((t) => ({ slug: t.slug, title: t.title, week_from: t.week_from })) }))}
      ongoing={ongoingTopics(content.topics).map((t) => ({ slug: t.slug, title: t.title }))}
      statuses={statuses}
      currentWeek={week}
      summary={sum}
      locked={locked}
    />
  );

  return (
    <AppShell sidebar={sidebar} streak={<StreakBadge streak={streak} />} userName={s.display_name}>
      {children}
      <Chatbot />
    </AppShell>
  );
}
