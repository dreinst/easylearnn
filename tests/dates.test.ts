import { describe, expect, it } from "vitest";
import { addDays, diffDays, formatRange, formatYmd, isYmd, timeInTz, todayInTz } from "../lib/dates";

describe("dates", () => {
  it("addDays melewati akhir bulan dan tahun", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29"); // tahun kabisat
  });

  it("diffDays menghitung selisih dua arah", () => {
    expect(diffDays("2026-09-14", "2026-09-21")).toBe(7);
    expect(diffDays("2026-09-21", "2026-09-14")).toBe(-7);
    expect(diffDays("2026-12-25", "2027-01-01")).toBe(7);
  });

  it("todayInTz mengikuti zona waktu profil, bukan UTC", () => {
    // 2026-09-14 20:30 UTC = 15 Sep 03:30 WIB
    const now = new Date("2026-09-14T20:30:00Z");
    expect(todayInTz("Asia/Jakarta", now)).toBe("2026-09-15");
    expect(todayInTz("UTC", now)).toBe("2026-09-14");
    expect(todayInTz("America/Los_Angeles", now)).toBe("2026-09-14");
  });

  it("timeInTz memakai format 24 jam", () => {
    const now = new Date("2026-09-14T13:05:00Z"); // 20:05 WIB
    expect(timeInTz("Asia/Jakarta", now)).toBe("20:05");
    expect(timeInTz("Asia/Jakarta", new Date("2026-09-14T17:00:00Z"))).toBe("00:00");
  });

  it("isYmd menolak format lain", () => {
    expect(isYmd("2026-09-14")).toBe(true);
    expect(isYmd("14-09-2026")).toBe(false);
    expect(isYmd("2026-13-40")).toBe(false);
  });

  it("format Indonesia", () => {
    expect(formatYmd("2026-09-14")).toBe("14 Sep 2026");
    expect(formatYmd("2026-09-14", true)).toBe("Sen 14 Sep 2026");
    expect(formatRange("2026-09-14", "2026-09-20")).toBe("14 sampai 20 Sep 2026");
    expect(formatRange("2026-09-28", "2026-10-04")).toBe("28 Sep 2026 sampai 4 Okt 2026");
  });
});
