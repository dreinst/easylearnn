import type { Content, Topic, TopicStatus } from "./types";

export type LockInfo = { locked: boolean; blocker: Topic | null };

/**
 * Pembatas modul: topik mingguan dibuka berurutan. Sebuah topik terkunci kalau ada
 * topik mingguan sebelumnya (urutan sort_order) yang belum selesai (kuis lulus).
 * Topik "sepanjang program" (week_from null) tidak pernah terkunci.
 */
export function lockInfo(content: Content, statuses: Record<string, TopicStatus>, slug: string): LockInfo {
  const topic = content.topics.find((t) => t.slug === slug);
  if (!topic || topic.week_from == null) return { locked: false, blocker: null };
  const weekly = content.topics.filter((t) => t.week_from != null).sort((a, b) => a.sort_order - b.sort_order);
  for (const t of weekly) {
    if (t.slug === slug) break;
    if (!statuses[t.slug]?.done) return { locked: true, blocker: t };
  }
  return { locked: false, blocker: null };
}

/** Topik mingguan pertama yang belum selesai: modul yang harus dikerjakan sekarang. */
export function currentModule(content: Content, statuses: Record<string, TopicStatus>): Topic | null {
  const weekly = content.topics.filter((t) => t.week_from != null).sort((a, b) => a.sort_order - b.sort_order);
  return weekly.find((t) => !statuses[t.slug]?.done) ?? null;
}

export function lockedSlugs(content: Content, statuses: Record<string, TopicStatus>): Set<string> {
  const out = new Set<string>();
  for (const t of content.topics) if (lockInfo(content, statuses, t.slug).locked) out.add(t.slug);
  return out;
}
