import { describe, expect, it } from "vitest";
import { buildRundown, phaseDates, topicsForWeek, weekEnd, weekOf, weekStart } from "../lib/timeline";
import type { Phase, Topic } from "../lib/types";

const topic = (slug: string, from: number | null, to: number | null, order: number): Topic => ({
  slug, title: slug, curriculum_ref: "", phase_id: 1, week_from: from, week_to: to, summary: "",
  units: [], university: [], points: [], evidence_brief: "", sources: [], questions: [], sort_order: order,
});

describe("timeline", () => {
  it("weekStart/weekEnd: mulai hari Minggu", () => {
    const start = "2026-09-13"; // Minggu
    expect(weekStart(start, 1)).toBe("2026-09-13");
    expect(weekEnd(start, 1)).toBe("2026-09-19");
    expect(weekStart(start, 2)).toBe("2026-09-20");
    expect(weekStart(start, 24)).toBe("2027-02-21");
    expect(weekEnd(start, 24)).toBe("2027-02-27");
  });

  it("weekStart: mulai tengah minggu (Rabu) tetap 7 hari per minggu", () => {
    const start = "2026-09-16"; // Rabu
    expect(weekStart(start, 2)).toBe("2026-09-23");
    expect(weekEnd(start, 2)).toBe("2026-09-29");
  });

  it("weekOf: sebelum mulai = 0, hari pertama = 1, hari ke-7 masih minggu 1, hari ke-8 minggu 2", () => {
    const start = "2026-09-14";
    expect(weekOf(start, "2026-09-13")).toBe(0);
    expect(weekOf(start, "2026-09-14")).toBe(1);
    expect(weekOf(start, "2026-09-20")).toBe(1);
    expect(weekOf(start, "2026-09-21")).toBe(2);
  });

  it("weekOf: lompat tahun dan selesai program", () => {
    const start = "2026-11-30";
    expect(weekOf(start, "2027-01-04")).toBe(6);
    expect(weekOf(start, "2027-05-16")).toBe(24); // hari terakhir minggu 24
    expect(weekOf(start, "2027-05-17")).toBe(25); // lewat
  });

  it("phaseDates memakai minggu awal dan akhir fase", () => {
    const phase: Phase = { id: 2, name: "Uang", week_from: 5, week_to: 8, rationale: "" };
    expect(phaseDates("2026-09-14", phase)).toEqual({ from: "2026-10-12", to: "2026-11-08" });
    expect(phaseDates("2026-09-14", { ...phase, id: 0, week_from: null, week_to: null })).toBeNull();
  });

  it("topicsForWeek mengambil topik dua minggu dan mengabaikan topik paralel", () => {
    const topics = [topic("a", 1, 1, 1), topic("b", 2, 3, 2), topic("pb", null, null, 99)];
    expect(topicsForWeek(topics, 2).map((t) => t.slug)).toEqual(["b"]);
    expect(topicsForWeek(topics, 3).map((t) => t.slug)).toEqual(["b"]);
    expect(topicsForWeek(topics, 4)).toEqual([]);
  });

  it("buildRundown menghasilkan 24 baris dengan fase", () => {
    const phases: Phase[] = [
      { id: 1, name: "A", week_from: 1, week_to: 2, rationale: "" },
      { id: 2, name: "B", week_from: 3, week_to: 24, rationale: "" },
    ];
    const rows = buildRundown("2026-09-14", phases, [topic("a", 1, 2, 1)]);
    expect(rows).toHaveLength(24);
    expect(rows[0].phase_id).toBe(1);
    expect(rows[2].phase_id).toBe(2);
    expect(rows[1].topics[0].slug).toBe("a");
    expect(rows[23].from).toBe("2027-02-22");
    expect(buildRundown(null, phases, [])[0].from).toBe("");
  });
});
