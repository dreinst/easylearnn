"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Q = { id: string; stem: string; options: string[] };
type Result = { score: number; total: number; passed: boolean; results: { id: string; chosen: number; correct_index: number; correct: boolean; explanation: string }[] };

export default function Quiz({ slug, questions, attempts }: { slug: string; questions: Q[]; attempts: number }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(questions.map(() => -1));
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const complete = answers.every((a) => a >= 0);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, answers }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Gagal mengirim jawaban");
      return;
    }
    setResult(await res.json());
    router.refresh();
  }

  function retry() {
    setAnswers(questions.map(() => -1));
    setResult(null);
  }

  return (
    <div className="mt-4 space-y-5">
      {attempts > 0 && !result && <p className="text-xs text-mute">Sudah {attempts} kali dikerjakan.</p>}
      {questions.map((q, i) => {
        const r = result?.results[i];
        return (
          <fieldset key={q.id} className="rounded-md border border-line p-4">
            <legend className="px-1 text-sm font-semibold text-navy">{i + 1}. {q.stem}</legend>
            <div className="mt-2 space-y-1.5">
              {q.options.map((o, j) => {
                const chosen = answers[i] === j;
                let cls = "border-line";
                if (r) {
                  if (j === r.correct_index) cls = "border-emerald-500 bg-emerald-50";
                  else if (chosen && !r.correct) cls = "border-red-400 bg-red-50";
                } else if (chosen) cls = "border-orange bg-orange/10";
                return (
                  <label key={j} className={`flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm ${cls}`}>
                    <input
                      type="radio"
                      name={q.id}
                      className="mt-1"
                      checked={chosen}
                      disabled={Boolean(result)}
                      onChange={() => setAnswers((a) => a.map((v, k) => (k === i ? j : v)))}
                    />
                    <span><span className="mr-1 font-mono text-xs text-mute">{String.fromCharCode(65 + j)}.</span>{o}</span>
                  </label>
                );
              })}
            </div>
            {r && (
              <p className={`mt-3 rounded px-3 py-2 text-sm ${r.correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
                <span className="font-semibold">{r.correct ? "Benar. " : `Kurang tepat. Jawaban: ${String.fromCharCode(65 + r.correct_index)}. `}</span>{r.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!result ? (
        <button className="btn-orange" onClick={submit} disabled={!complete || busy}>{busy ? "Menilai" : "Kirim jawaban"}</button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className={result.passed ? "badge-ok" : "badge-warn"}>{result.passed ? "Lulus" : "Belum lulus"}: {result.score}/{result.total}</span>
          <button className="btn-ghost" onClick={retry}>Ulangi kuis</button>
          <span className="text-xs text-mute">Hari belajar hari ini sudah tercatat.</span>
        </div>
      )}
    </div>
  );
}
