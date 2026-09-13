import { describe, expect, it } from "vitest";
import content from "../content/topics.json";
import type { Content } from "../lib/types";

const c = content as Content;

describe("seed content", () => {
  it("23 topik, 69 soal, 6 fase + fase 0", () => {
    expect(c.topics).toHaveLength(23);
    expect(c.topics.reduce((n, t) => n + t.questions.length, 0)).toBe(69);
    expect(c.phases.map((p) => p.id).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("slug unik dan tiap soal punya 4 pilihan dengan kunci valid", () => {
    const slugs = new Set(c.topics.map((t) => t.slug));
    expect(slugs.size).toBe(23);
    for (const t of c.topics) {
      expect(t.questions).toHaveLength(3);
      for (const q of t.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.correct_index).toBeGreaterThanOrEqual(0);
        expect(q.correct_index).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
      expect(t.points.length).toBeGreaterThanOrEqual(5);
      expect(t.units.length).toBeGreaterThanOrEqual(1);
      expect(t.university.length).toBeGreaterThanOrEqual(1);
      expect(t.sources.length).toBeGreaterThanOrEqual(2);
      expect(t.evidence_brief.length).toBeGreaterThan(40);
    }
  });

  it("20 topik mingguan menutup minggu 1 sampai 24 tanpa celah, 3 topik paralel", () => {
    const weekly = c.topics.filter((t) => t.week_from != null);
    const ongoing = c.topics.filter((t) => t.week_from == null);
    expect(weekly).toHaveLength(20);
    expect(ongoing).toHaveLength(3);
    for (let w = 1; w <= 24; w++) {
      const hits = weekly.filter((t) => t.week_from! <= w && w <= t.week_to!);
      expect(hits, `minggu ${w}`).toHaveLength(1);
    }
    for (const t of weekly) {
      const phase = c.phases.find((p) => p.id === t.phase_id)!;
      expect(t.week_from!).toBeGreaterThanOrEqual(phase.week_from!);
      expect(t.week_to!).toBeLessThanOrEqual(phase.week_to!);
    }
    for (const t of ongoing) expect(t.phase_id).toBe(0);
  });

  it("tidak ada tanda pisah panjang di teks", () => {
    const text = JSON.stringify(c);
    expect(text).not.toMatch(/[—–]/);
    expect(text).not.toMatch(/\s--\s/);
  });
});
