import { describe, expect, it } from "vitest";
import { computeStreak, lastSevenDays } from "../lib/streak";

describe("computeStreak", () => {
  it("kosong = 0", () => {
    expect(computeStreak([], "2026-09-14")).toEqual({ count: 0, studied_today: false, at_risk: false });
  });

  it("hari ini belajar, tiga hari berturut", () => {
    const days = ["2026-09-12", "2026-09-13", "2026-09-14"];
    expect(computeStreak(days, "2026-09-14")).toEqual({ count: 3, studied_today: true, at_risk: false });
  });

  it("hari ini belum, kemarin ada: streak hidup tapi berisiko", () => {
    const days = ["2026-09-12", "2026-09-13"];
    expect(computeStreak(days, "2026-09-14")).toEqual({ count: 2, studied_today: false, at_risk: true });
  });

  it("kemarin kosong: streak putus walau lusa ada", () => {
    expect(computeStreak(["2026-09-12"], "2026-09-14").count).toBe(0);
  });

  it("hari duplikat dan urutan acak tidak mengubah hasil", () => {
    const days = ["2026-09-14", "2026-09-13", "2026-09-13", "2026-09-11", "2026-09-12"];
    expect(computeStreak(days, "2026-09-14").count).toBe(4);
  });

  it("streak melewati pergantian tahun", () => {
    const days = ["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"];
    expect(computeStreak(days, "2027-01-02").count).toBe(4);
  });
});

describe("lastSevenDays", () => {
  it("mengembalikan 7 hari berurutan yang berakhir hari ini", () => {
    const out = lastSevenDays(["2026-09-14", "2026-09-10"], "2026-09-14");
    expect(out.map((d) => d.day)).toEqual([
      "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14",
    ]);
    expect(out.filter((d) => d.studied).map((d) => d.day)).toEqual(["2026-09-10", "2026-09-14"]);
  });
});
