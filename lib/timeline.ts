import { addDays, diffDays } from "./dates";
import type { Phase, Topic } from "./types";

export const PROGRAM_WEEKS = 24;

/** Tanggal mulai minggu ke-n (minggu 1 = tanggal mulai program). */
export function weekStart(programStart: string, week: number): string {
  return addDays(programStart, (week - 1) * 7);
}

/** Tanggal terakhir minggu ke-n. */
export function weekEnd(programStart: string, week: number): string {
  return addDays(programStart, week * 7 - 1);
}

/**
 * Minggu berjalan. 0 = belum mulai, 1..24 = minggu program,
 * 25 = program sudah lewat.
 */
export function weekOf(programStart: string, today: string, totalWeeks = PROGRAM_WEEKS): number {
  const days = diffDays(programStart, today);
  if (days < 0) return 0;
  const week = Math.floor(days / 7) + 1;
  return week > totalWeeks ? totalWeeks + 1 : week;
}

export function phaseDates(programStart: string, phase: Phase): { from: string; to: string } | null {
  if (phase.week_from == null || phase.week_to == null) return null;
  return { from: weekStart(programStart, phase.week_from), to: weekEnd(programStart, phase.week_to) };
}

export function topicsForWeek(topics: Topic[], week: number): Topic[] {
  return topics
    .filter((t) => t.week_from != null && t.week_to != null && t.week_from <= week && week <= t.week_to)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Topik paralel (sepanjang program), tanpa minggu. */
export function ongoingTopics(topics: Topic[]): Topic[] {
  return topics.filter((t) => t.week_from == null).sort((a, b) => a.sort_order - b.sort_order);
}

export function weeklyTopics(topics: Topic[]): Topic[] {
  return topics.filter((t) => t.week_from != null).sort((a, b) => a.sort_order - b.sort_order);
}

/** Baris rundown: satu baris per minggu, dengan topik yang berjalan di minggu itu. */
export type RundownRow = { week: number; from: string; to: string; topics: Topic[]; phase_id: number | null };

export function buildRundown(
  programStart: string | null,
  phases: Phase[],
  topics: Topic[],
  totalWeeks = PROGRAM_WEEKS,
): RundownRow[] {
  const rows: RundownRow[] = [];
  for (let week = 1; week <= totalWeeks; week++) {
    const phase = phases.find((p) => p.week_from != null && p.week_to != null && p.week_from <= week && week <= p.week_to);
    rows.push({
      week,
      from: programStart ? weekStart(programStart, week) : "",
      to: programStart ? weekEnd(programStart, week) : "",
      topics: topicsForWeek(topics, week),
      phase_id: phase?.id ?? null,
    });
  }
  return rows;
}
