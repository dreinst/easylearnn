import { describe, expect, it } from "vitest";
import { currentModule, lockInfo, lockedSlugs } from "../lib/progression";
import type { Content, Topic, TopicStatus } from "../lib/types";

const topic = (slug: string, from: number | null, order: number): Topic => ({
  slug, title: slug, curriculum_ref: "", phase_id: 1, week_from: from, week_to: from, summary: "",
  units: [], university: [], points: [], evidence_brief: "", sources: [], questions: [], sort_order: order,
});
const content: Content = { version: 1, program_weeks: 24, phases: [], topics: [topic("a", 1, 1), topic("b", 2, 2), topic("c", 3, 3), topic("pb", null, 101)] };
const st = (done: string[]): Record<string, TopicStatus> =>
  Object.fromEntries(content.topics.map((t) => [t.slug, { quiz_passed: done.includes(t.slug), done: done.includes(t.slug), best_score: null, attempts: 0 }]));

describe("pembatas modul", () => {
  it("topik pertama selalu terbuka, berikutnya terkunci sampai yang sebelumnya selesai", () => {
    const s = st([]);
    expect(lockInfo(content, s, "a").locked).toBe(false);
    expect(lockInfo(content, s, "b")).toEqual({ locked: true, blocker: content.topics[0] });
    expect(lockInfo(content, s, "c").blocker?.slug).toBe("a");
  });

  it("selesai satu membuka yang berikutnya saja", () => {
    const s = st(["a"]);
    expect(lockInfo(content, s, "b").locked).toBe(false);
    expect(lockInfo(content, s, "c")).toEqual({ locked: true, blocker: content.topics[1] });
    expect([...lockedSlugs(content, s)]).toEqual(["c"]);
  });

  it("topik sepanjang program tidak pernah terkunci", () => {
    expect(lockInfo(content, st([]), "pb").locked).toBe(false);
  });

  it("currentModule = topik mingguan pertama yang belum selesai", () => {
    expect(currentModule(content, st([]))?.slug).toBe("a");
    expect(currentModule(content, st(["a", "b"]))?.slug).toBe("c");
    expect(currentModule(content, st(["a", "b", "c"]))).toBeNull();
  });

  it("kuis lulus saja belum membuka modul berikutnya", () => {
    const s = st([]);
    s.a = { ...s.a, quiz_passed: true, done: false };
    expect(lockInfo(content, s, "b").locked).toBe(true);
  });
});
