"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Phase, Question, Source, Topic, Unit, UniversityRef } from "@/lib/types";

const KINDS = ["aqf_unit", "university", "standard", "framework", "guide", "certification", "course", "textbook"];

export default function TopicEditor({ topic, phases }: { topic: Topic; phases: Phase[] }) {
  const router = useRouter();
  const [t, setT] = useState<Topic>(structuredClone(topic));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const set = <K extends keyof Topic>(k: K, v: Topic[K]) => setT((x) => ({ ...x, [k]: v }));
  const updItem = <K extends "units" | "university" | "sources" | "questions">(k: K, i: number, patch: Partial<Topic[K][number]>) =>
    setT((x) => ({ ...x, [k]: x[k].map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const delItem = (k: "units" | "university" | "sources" | "questions", i: number) => setT((x) => ({ ...x, [k]: x[k].filter((_, j) => j !== i) }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(""); setError("");
    for (const q of t.questions) {
      if (q.options.length !== 4 || q.options.some((o) => !o.trim()) || !q.stem.trim() || !q.explanation.trim()) {
        setBusy(false); setError("Setiap soal butuh pertanyaan, 4 pilihan terisi, dan penjelasan."); return;
      }
    }
    const res = await fetch("/api/admin/topic", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(t) });
    setBusy(false);
    if (!res.ok) { const b = await res.json().catch(() => ({})); setError(b.error || "Gagal menyimpan"); return; }
    setMsg("Tersimpan.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <section className="card grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><label className="label">Judul</label><input className="input" value={t.title} onChange={(e) => set("title", e.target.value)} required /></div>
        <div><label className="label">Acuan kurikulum</label><input className="input" value={t.curriculum_ref} onChange={(e) => set("curriculum_ref", e.target.value)} /></div>
        <div>
          <label className="label">Fase</label>
          <select className="input" value={t.phase_id} onChange={(e) => set("phase_id", Number(e.target.value))}>
            {phases.map((p) => <option key={p.id} value={p.id}>{p.id}: {p.name}</option>)}
          </select>
        </div>
        <div><label className="label">Minggu dari (kosong = sepanjang program)</label><input className="input" type="number" min={1} max={24} value={t.week_from ?? ""} onChange={(e) => set("week_from", e.target.value ? Number(e.target.value) : null)} /></div>
        <div><label className="label">Minggu sampai</label><input className="input" type="number" min={1} max={24} value={t.week_to ?? ""} onChange={(e) => set("week_to", e.target.value ? Number(e.target.value) : null)} /></div>
        <div className="md:col-span-2"><label className="label">Ringkasan</label><textarea className="input min-h-20" value={t.summary} onChange={(e) => set("summary", e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">Inti materi (satu poin per baris)</label><textarea className="input min-h-40 font-mono text-xs" value={t.points.join("\n")} onChange={(e) => set("points", e.target.value.split("\n").filter((l) => l.trim()))} /></div>
        <div className="md:col-span-2"><label className="label">Bukti kerja yang diminta</label><textarea className="input min-h-24" value={t.evidence_brief} onChange={(e) => set("evidence_brief", e.target.value)} /></div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-navy">Unit kompetensi AQF</h2><button type="button" className="btn-ghost text-xs" onClick={() => set("units", [...t.units, { unit_code: "", unit_name: "", is_core: false, url: "" } as Unit])}>Tambah</button></div>
        {t.units.map((u, i) => (
          <div key={i} className="mt-2 grid gap-2 md:grid-cols-[120px_1fr_1fr_auto_auto]">
            <input className="input font-mono text-xs" placeholder="Kode" value={u.unit_code} onChange={(e) => updItem("units", i, { unit_code: e.target.value })} />
            <input className="input" placeholder="Nama unit" value={u.unit_name} onChange={(e) => updItem("units", i, { unit_name: e.target.value })} />
            <input className="input text-xs" placeholder="URL" value={u.url} onChange={(e) => updItem("units", i, { url: e.target.value })} />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={u.is_core} onChange={(e) => updItem("units", i, { is_core: e.target.checked })} />inti</label>
            <button type="button" className="text-xs text-red-700" onClick={() => delItem("units", i)}>hapus</button>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-navy">Modul kampus</h2><button type="button" className="btn-ghost text-xs" onClick={() => set("university", [...t.university, { institution: "", programme: "", module: "", url: "" } as UniversityRef])}>Tambah</button></div>
        {t.university.map((m, i) => (
          <div key={i} className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <input className="input" placeholder="Kampus" value={m.institution} onChange={(e) => updItem("university", i, { institution: e.target.value })} />
            <input className="input" placeholder="Program" value={m.programme} onChange={(e) => updItem("university", i, { programme: e.target.value })} />
            <input className="input" placeholder="Modul" value={m.module} onChange={(e) => updItem("university", i, { module: e.target.value })} />
            <input className="input text-xs" placeholder="URL" value={m.url} onChange={(e) => updItem("university", i, { url: e.target.value })} />
            <button type="button" className="text-xs text-red-700" onClick={() => delItem("university", i)}>hapus</button>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-navy">Sumber</h2><button type="button" className="btn-ghost text-xs" onClick={() => set("sources", [...t.sources, { id: `${t.slug}-s${Date.now()}`, title: "", description: "", url: "", kind: "guide", embeddable: null } as Source])}>Tambah</button></div>
        {t.sources.map((s, i) => (
          <div key={s.id} className="mt-3 grid gap-2 rounded border border-line p-3 md:grid-cols-[1fr_140px_auto]">
            <input className="input" placeholder="Judul" value={s.title} onChange={(e) => updItem("sources", i, { title: e.target.value })} />
            <select className="input" value={s.kind} onChange={(e) => updItem("sources", i, { kind: e.target.value as Source["kind"] })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
            <button type="button" className="text-xs text-red-700" onClick={() => delItem("sources", i)}>hapus</button>
            <input className="input text-xs md:col-span-3" placeholder="URL" value={s.url} onChange={(e) => updItem("sources", i, { url: e.target.value, embeddable: null })} />
            <input className="input text-xs md:col-span-3" placeholder="Deskripsi singkat" value={s.description} onChange={(e) => updItem("sources", i, { description: e.target.value })} />
          </div>
        ))}
      </section>

      <section className="card">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-navy">Soal kuis</h2><button type="button" className="btn-ghost text-xs" onClick={() => set("questions", [...t.questions, { id: `${t.slug}-q${Date.now()}`, stem: "", options: ["", "", "", ""], correct_index: 0, explanation: "" } as Question])}>Tambah soal</button></div>
        {t.questions.map((q, i) => (
          <div key={q.id} className="mt-3 rounded border border-line p-3">
            <div className="flex items-start gap-2">
              <span className="mt-2 font-mono text-xs text-mute">{i + 1}.</span>
              <textarea className="input min-h-16" placeholder="Pertanyaan" value={q.stem} onChange={(e) => updItem("questions", i, { stem: e.target.value })} />
              <button type="button" className="text-xs text-red-700" onClick={() => delItem("questions", i)}>hapus</button>
            </div>
            <div className="mt-2 grid gap-1.5">
              {q.options.map((o, j) => (
                <label key={j} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={`c-${q.id}`} checked={q.correct_index === j} onChange={() => updItem("questions", i, { correct_index: j })} title="Jawaban benar" />
                  <span className="w-4 font-mono text-xs text-mute">{String.fromCharCode(65 + j)}</span>
                  <input className="input" value={o} onChange={(e) => updItem("questions", i, { options: q.options.map((x, k) => (k === j ? e.target.value : x)) })} />
                </label>
              ))}
            </div>
            <textarea className="input mt-2 min-h-14" placeholder="Penjelasan jawaban" value={q.explanation} onChange={(e) => updItem("questions", i, { explanation: e.target.value })} />
          </div>
        ))}
      </section>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      <div className="flex gap-3">
        <button className="btn-orange" disabled={busy}>{busy ? "Menyimpan" : "Simpan topik"}</button>
        <Link href="/admin" className="btn-ghost">Kembali</Link>
        <Link href={`/topic/${t.slug}`} className="btn-ghost">Lihat topik</Link>
      </div>
    </form>
  );
}
