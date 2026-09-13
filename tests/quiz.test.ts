import { describe, expect, it } from "vitest";
import { gradeQuiz, passMark, stripAnswers } from "../lib/quiz";
import type { Question } from "../lib/types";

const q = (id: string, correct: number): Question => ({
  id, stem: "s", options: ["a", "b", "c", "d"], correct_index: correct, explanation: "karena",
});

describe("quiz", () => {
  it("passMark = ceil(2/3 total)", () => {
    expect(passMark(3)).toBe(2);
    expect(passMark(4)).toBe(3);
    expect(passMark(5)).toBe(4);
    expect(passMark(6)).toBe(4);
  });

  it("menilai dan mengembalikan penjelasan tiap soal", () => {
    const r = gradeQuiz([q("1", 0), q("2", 1), q("3", 2)], [0, 1, 3]);
    expect(r.score).toBe(2);
    expect(r.total).toBe(3);
    expect(r.passed).toBe(true);
    expect(r.results[2]).toEqual({ id: "3", chosen: 3, correct_index: 2, correct: false, explanation: "karena" });
  });

  it("satu benar dari tiga = tidak lulus, jawaban kosong (-1) dihitung salah", () => {
    const r = gradeQuiz([q("1", 0), q("2", 1), q("3", 2)], [0, -1, -1]);
    expect(r.passed).toBe(false);
  });

  it("menolak jumlah jawaban yang tidak cocok atau di luar pilihan", () => {
    expect(() => gradeQuiz([q("1", 0)], [])).toThrow();
    expect(() => gradeQuiz([q("1", 0)], [7])).toThrow();
  });

  it("stripAnswers tidak membocorkan kunci", () => {
    const s = stripAnswers([q("1", 2)]);
    expect(s[0]).toEqual({ id: "1", stem: "s", options: ["a", "b", "c", "d"] });
    expect(JSON.stringify(s)).not.toContain("correct");
  });
});
