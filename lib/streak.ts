import { addDays } from "./dates";

export type StreakInfo = {
  count: number;
  studied_today: boolean;
  /** true = kemarin belajar, hari ini belum: streak masih hidup tapi akan putus malam ini */
  at_risk: boolean;
};

/**
 * Streak = jumlah hari berturut-turut yang berakhir hari ini atau kemarin.
 * Hari ini belum ada tapi kemarin ada: streak masih hidup (at_risk).
 * Kemarin juga kosong: 0.
 */
export function computeStreak(studyDays: string[], today: string): StreakInfo {
  const set = new Set(studyDays);
  const studiedToday = set.has(today);
  let cursor = studiedToday ? today : addDays(today, -1);
  if (!set.has(cursor)) return { count: 0, studied_today: false, at_risk: false };
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return { count, studied_today: studiedToday, at_risk: !studiedToday };
}

/** Tujuh hari terakhir yang berakhir hari ini, untuk indikator streak. */
export function lastSevenDays(studyDays: string[], today: string): { day: string; studied: boolean }[] {
  const set = new Set(studyDays);
  const out: { day: string; studied: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDays(today, -i);
    out.push({ day, studied: set.has(day) });
  }
  return out;
}
