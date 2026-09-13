import type { Question } from "./types";

export type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  results: { id: string; chosen: number; correct_index: number; correct: boolean; explanation: string }[];
};

export function passMark(total: number): number {
  return Math.ceil((total * 2) / 3);
}

/** Penilaian di server. answers[i] = indeks pilihan, -1 kalau kosong. */
export function gradeQuiz(questions: Question[], answers: number[]): QuizResult {
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new Error("Jumlah jawaban tidak sama dengan jumlah soal");
  }
  const results = questions.map((q, i) => {
    const chosen = Number.isInteger(answers[i]) ? answers[i] : -1;
    if (chosen < -1 || chosen >= q.options.length) {
      throw new Error(`Jawaban soal ${i + 1} di luar pilihan`);
    }
    const correct = chosen === q.correct_index;
    return { id: q.id, chosen, correct_index: q.correct_index, correct, explanation: q.explanation };
  });
  const score = results.filter((r) => r.correct).length;
  const total = questions.length;
  return { score, total, passed: score >= passMark(total), results };
}

/** Versi soal tanpa kunci jawaban, aman dikirim ke client sebelum submit. */
export function stripAnswers(questions: Question[]): { id: string; stem: string; options: string[] }[] {
  return questions.map((q) => ({ id: q.id, stem: q.stem, options: q.options }));
}
