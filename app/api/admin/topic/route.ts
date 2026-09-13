import { NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/data";
import type { Topic } from "@/lib/types";

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as Topic | null;
  if (!body || typeof body.slug !== "string") return NextResponse.json({ error: "Data topik tidak valid" }, { status: 400 });
  const content = await getContent();
  const idx = content.topics.findIndex((t) => t.slug === body.slug);
  if (idx < 0) return NextResponse.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const clean: Topic = {
    ...content.topics[idx],
    title: String(body.title || "").trim(),
    curriculum_ref: String(body.curriculum_ref || ""),
    phase_id: Number(body.phase_id),
    week_from: body.week_from == null ? null : Number(body.week_from),
    week_to: body.week_to == null ? null : Number(body.week_to),
    summary: String(body.summary || ""),
    points: (body.points || []).map(String).filter((p) => p.trim()),
    evidence_brief: String(body.evidence_brief || ""),
    units: (body.units || []).filter((u) => u.unit_code).map((u) => ({ unit_code: u.unit_code.trim(), unit_name: u.unit_name || "", is_core: Boolean(u.is_core), url: u.url || "" })),
    university: (body.university || []).filter((m) => m.module || m.institution),
    sources: (body.sources || []).filter((s) => s.url && s.title).map((s) => ({ ...s, embeddable: s.embeddable ?? null })),
    questions: (body.questions || []).map((q) => ({ id: q.id, stem: q.stem, options: q.options.slice(0, 4), correct_index: Number(q.correct_index), explanation: q.explanation })),
  };
  if (!clean.title) return NextResponse.json({ error: "Judul wajib" }, { status: 400 });
  for (const q of clean.questions) {
    if (q.options.length !== 4 || q.correct_index < 0 || q.correct_index > 3) return NextResponse.json({ error: "Soal harus punya 4 pilihan dan kunci valid" }, { status: 400 });
  }
  content.topics[idx] = clean;
  await saveContent(content);
  return NextResponse.json({ ok: true });
}
