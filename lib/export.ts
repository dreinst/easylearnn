import type { Content, Evidence, Progress, Topic } from "./types";
import { topicStatus, overall, statusMap } from "./status";
import { formatYmd } from "./dates";
import type { Block } from "./pdf";

const KIND: Record<string, string> = {
  aqf_unit: "Unit AQF", university: "Kampus", standard: "Standar", framework: "Kerangka", guide: "Panduan",
  certification: "Sertifikasi", course: "Kursus gratis", textbook: "Buku teks",
};

function weekLabel(topic: Topic): string {
  if (topic.week_from == null) return "Sepanjang program";
  return topic.week_to !== topic.week_from ? `Minggu ${topic.week_from} sampai ${topic.week_to}` : `Minggu ${topic.week_from}`;
}

function evidenceLines(e: Evidence): string[] {
  const out = [`**${e.title}** (${formatYmd(e.submitted_at.slice(0, 10), true)})`];
  if (e.note) out.push("", ...e.note.split("\n").map((l) => `> ${l}`));
  const refs: string[] = [];
  if (e.link) refs.push(`Tautan: ${e.link}`);
  if (e.file) refs.push(`Lampiran: ${e.file.replace(/^[0-9a-f]{8}-/, "")}`);
  refs.push(`Berkas jurnal: jurnal/${e.journal_file}`);
  out.push("", ...refs.map((r) => `- ${r}`));
  return out;
}

/** Rangkuman topik dalam Markdown yang rapi (judul, tabel, daftar), termasuk jurnal bukti kerja. */
export function topicToMarkdown(topic: Topic, content: Content, progress?: Progress): string {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const st = progress ? topicStatus(progress, topic.slug) : null;
  const evidence = progress ? progress.evidence.filter((e) => e.topic === topic.slug) : [];
  const L: string[] = [];
  L.push(`# ${topic.title}`, "");
  L.push(`> ${topic.summary}`, "");
  L.push("| | |", "|---|---|");
  L.push(`| Acuan kurikulum | ${topic.curriculum_ref} |`);
  if (phase) L.push(`| Fase | ${phase.id === 0 ? phase.name : `${phase.id}. ${phase.name}`} |`);
  L.push(`| Jadwal | ${weekLabel(topic)} |`);
  if (st) {
    L.push(`| Kuis | ${st.quiz_passed ? "lulus" : "belum lulus"}${st.best_score != null ? ` (terbaik ${st.best_score}/${topic.questions.length})` : ""} |`);
    L.push(`| Bukti kerja | ${st.evidence_done ? `${evidence.length} berkas` : "belum ada"} |`);
    L.push(`| Status | ${st.done ? "selesai" : "belum selesai"} |`);
  }
  L.push("");
  L.push("## Acuan", "");
  L.push("### Unit kompetensi AQF (SIT50322)", "");
  L.push("| Kode | Nama unit | Inti |", "|---|---|---|");
  for (const u of topic.units) L.push(`| [${u.unit_code}](${u.url}) | ${u.unit_name} | ${u.is_core ? "ya" : ""} |`);
  L.push("");
  if (topic.university.length) {
    L.push("### Modul kampus pembanding", "");
    for (const m of topic.university) L.push(`- **${m.module}**, ${m.institution}, [${m.programme}](${m.url})`);
    L.push("");
  }
  L.push("## Inti materi", "");
  topic.points.forEach((p, i) => L.push(`${i + 1}. ${p}`));
  L.push("");
  L.push("## Bukti kerja yang diminta", "");
  L.push(topic.evidence_brief, "");
  if (progress) {
    L.push("## Jurnal bukti kerja", "");
    if (!evidence.length) L.push("_Belum ada bukti kerja untuk topik ini._", "");
    for (const e of [...evidence].sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1))) L.push(...evidenceLines(e), "");
  }
  L.push("## Sumber", "");
  L.push("| Jenis | Sumber | Keterangan |", "|---|---|---|");
  for (const s of topic.sources) L.push(`| ${KIND[s.kind] || s.kind} | [${s.title}](${s.url}) | ${s.description || ""} |`);
  L.push("");
  L.push("## Kuis (tanpa kunci jawaban)", "");
  topic.questions.forEach((q, i) => {
    L.push(`${i + 1}. ${q.stem}`);
    q.options.forEach((o, j) => L.push(`   - ${String.fromCharCode(65 + j)}. ${o}`));
  });
  L.push("", "---", "", `_Production Book, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}._`, "");
  return L.join("\n");
}

/** Blok PDF untuk satu topik: materi plus jurnal bukti kerja. */
export function topicToBlocks(topic: Topic, content: Content, progress: Progress): Block[] {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const st = topicStatus(progress, topic.slug);
  const evidence = progress.evidence.filter((e) => e.topic === topic.slug).sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
  const B: Block[] = [];
  B.push({ type: "title", text: topic.title });
  B.push({ type: "small", text: `${topic.curriculum_ref}  |  ${phase ? (phase.id === 0 ? phase.name : `Fase ${phase.id}: ${phase.name}`) : ""}  |  ${weekLabel(topic)}` });
  B.push({ type: "p", text: topic.summary });
  B.push({ type: "kv", key: "Kuis", value: `${st.quiz_passed ? "lulus" : "belum lulus"}${st.best_score != null ? ` (terbaik ${st.best_score}/${topic.questions.length}, ${st.attempts} kali)` : ""}` });
  B.push({ type: "kv", key: "Bukti kerja", value: st.evidence_done ? `${evidence.length} berkas` : "belum ada" });
  B.push({ type: "kv", key: "Status topik", value: st.done ? "selesai" : "belum selesai (perlu kuis lulus dan bukti kerja)" });

  B.push({ type: "h1", text: "Acuan" });
  for (const u of topic.units) B.push({ type: "li", text: `${u.unit_code} ${u.unit_name}${u.is_core ? " (unit inti)" : ""}` });
  for (const m of topic.university) B.push({ type: "li", text: `${m.module}, ${m.institution}, ${m.programme}` });

  B.push({ type: "h1", text: "Inti materi" });
  topic.points.forEach((p, i) => B.push({ type: "p", text: `${i + 1}. ${p}` }));

  B.push({ type: "h1", text: "Bukti kerja yang diminta" });
  B.push({ type: "p", text: topic.evidence_brief });

  B.push({ type: "h1", text: "Jurnal bukti kerja" });
  if (!evidence.length) B.push({ type: "p", text: "Belum ada bukti kerja untuk topik ini." });
  for (const e of evidence) {
    B.push({ type: "h2", text: `${e.title}  (${formatYmd(e.submitted_at.slice(0, 10), true)})` });
    if (e.note) B.push({ type: "p", text: e.note });
    if (e.link) B.push({ type: "kv", key: "Tautan", value: e.link });
    if (e.file) B.push({ type: "kv", key: "Lampiran", value: e.file.replace(/^[0-9a-f]{8}-/, "") });
    B.push({ type: "small", text: `Berkas jurnal: jurnal/${e.journal_file}` });
  }

  B.push({ type: "h1", text: "Sumber" });
  for (const s of topic.sources) B.push({ type: "li", text: `[${KIND[s.kind] || s.kind}] ${s.title}. ${s.url}` });
  return B;
}

/** Rangkuman portfolio (semua bukti kerja) dalam Markdown. */
export function portfolioToMarkdown(content: Content, progress: Progress): string {
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const L: string[] = [];
  L.push("# Portfolio bukti kerja", "");
  L.push(`Program belajar event management Enter Event House, 6 fase, ${content.program_weeks} minggu.`, "");
  L.push("| | |", "|---|---|");
  L.push(`| Nama | ${progress.settings.display_name || "-"} |`);
  L.push(`| Mulai program | ${progress.settings.program_start ? formatYmd(progress.settings.program_start, true) : "-"} |`);
  L.push(`| Topik selesai | ${sum.done} dari ${sum.total} |`);
  L.push(`| Kuis lulus | ${sum.quiz} |`);
  L.push(`| Topik dengan bukti kerja | ${sum.evidence} |`);
  L.push(`| Jumlah bukti kerja | ${progress.evidence.length} |`);
  L.push(`| Hari belajar tercatat | ${progress.study_days.length} |`, "");
  L.push("## Ringkasan per topik", "");
  L.push("| Jadwal | Topik | Kuis | Bukti | Status |", "|---|---|---|---|---|");
  for (const t of ordered) {
    const st = statuses[t.slug];
    L.push(`| ${weekLabel(t).replace("Minggu ", "M").replace(" sampai ", "-")} | ${t.title} | ${st.quiz_passed ? "lulus" : "belum"} | ${progress.evidence.filter((e) => e.topic === t.slug).length} | ${st.done ? "selesai" : "belum"} |`);
  }
  L.push("");
  L.push("## Bukti kerja", "");
  for (const t of ordered) {
    const items = progress.evidence.filter((e) => e.topic === t.slug).sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
    if (!items.length) continue;
    L.push(`### ${t.title}`, "", `_${t.curriculum_ref}. ${t.units.map((u) => u.unit_code).join(", ")}_`, "");
    for (const e of items) L.push(...evidenceLines(e), "");
  }
  L.push("---", "", `_Production Book, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}._`, "");
  return L.join("\n");
}

/** Blok PDF portfolio lengkap untuk dibawa ke uji kompetensi. */
export function portfolioToBlocks(content: Content, progress: Progress): Block[] {
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const B: Block[] = [];
  B.push({ type: "title", text: "Portfolio bukti kerja" });
  B.push({ type: "small", text: `Program belajar event management Enter Event House, 6 fase, ${content.program_weeks} minggu. Acuan AQF SIT50322 Diploma of Event Management.` });
  B.push({ type: "kv", key: "Nama", value: progress.settings.display_name || "-" });
  B.push({ type: "kv", key: "Mulai program", value: progress.settings.program_start ? formatYmd(progress.settings.program_start, true) : "-" });
  B.push({ type: "kv", key: "Topik selesai", value: `${sum.done} dari ${sum.total}` });
  B.push({ type: "kv", key: "Bukti kerja", value: `${progress.evidence.length} berkas di ${sum.evidence} topik` });
  B.push({ type: "kv", key: "Hari belajar tercatat", value: String(progress.study_days.length) });

  B.push({ type: "h1", text: "Ringkasan per topik" });
  for (const t of ordered) {
    const st = statuses[t.slug];
    const n = progress.evidence.filter((e) => e.topic === t.slug).length;
    B.push({ type: "li", text: `${weekLabel(t)}: ${t.title}. Kuis ${st.quiz_passed ? "lulus" : "belum"}, bukti ${n}, ${st.done ? "selesai" : "belum selesai"}.` });
  }

  B.push({ type: "h1", text: "Bukti kerja" });
  let any = false;
  for (const t of ordered) {
    const items = progress.evidence.filter((e) => e.topic === t.slug).sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
    if (!items.length) continue;
    any = true;
    B.push({ type: "h2", text: t.title });
    B.push({ type: "small", text: `${t.curriculum_ref}. Unit AQF: ${t.units.map((u) => `${u.unit_code} ${u.unit_name}`).join("; ")}` });
    for (const e of items) {
      B.push({ type: "p", text: `${e.title} (${formatYmd(e.submitted_at.slice(0, 10), true)})` });
      if (e.note) B.push({ type: "p", text: e.note });
      if (e.link) B.push({ type: "kv", key: "Tautan", value: e.link });
      if (e.file) B.push({ type: "kv", key: "Lampiran", value: e.file.replace(/^[0-9a-f]{8}-/, "") });
      B.push({ type: "small", text: `Berkas jurnal: jurnal/${e.journal_file}` });
      B.push({ type: "space", size: 4 });
    }
  }
  if (!any) B.push({ type: "p", text: "Belum ada bukti kerja." });
  return B;
}
