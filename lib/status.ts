import type { Content, Progress, Topic, TopicStatus } from "./types";

export function topicStatus(progress: Progress, slug: string): TopicStatus {
  const attempts = progress.quiz_attempts.filter((a) => a.topic === slug);
  const quiz_passed = attempts.some((a) => a.passed);
  const best_score = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;
  return { quiz_passed, done: quiz_passed, best_score, attempts: attempts.length };
}

export function statusMap(content: Content, progress: Progress): Record<string, TopicStatus> {
  const out: Record<string, TopicStatus> = {};
  for (const t of content.topics) out[t.slug] = topicStatus(progress, t.slug);
  return out;
}

export function overall(content: Content, statuses: Record<string, TopicStatus>) {
  const total = content.topics.length;
  const done = content.topics.filter((t) => statuses[t.slug]?.done).length;
  const quiz = content.topics.filter((t) => statuses[t.slug]?.quiz_passed).length;
  return { total, done, quiz, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function findTopic(content: Content, slug: string): Topic | undefined {
  return content.topics.find((t) => t.slug === slug);
}
