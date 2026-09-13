import type { Content, Progress, Topic } from "./types";
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

/** Rangkuman topik dalam Markdown yang rapi (judul, tabel, daftar). */
export function topicToMarkdown(topic: Topic, content: Content, progress?: Progress): string {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const st = progress ? topicStatus(progress, topic.slug) : null;
  const L: string[] = [];
  L.push(`# ${topic.title}`, "");
  L.push(`> ${topic.summary}`, "");
  L.push("| | |", "|---|---|");
  L.push(`| Acuan kurikulum | ${topic.curriculum_ref} |`);
  if (phase) L.push(`| Fase | ${phase.id === 0 ? phase.name : `${phase.id}. ${phase.name}`} |`);
  L.push(`| Jadwal | ${weekLabel(topic)} |`);
  if (st) {
    L.push(`| Kuis | ${st.quiz_passed ? "lulus" : "belum lulus"}${st.best_score != null ? ` (terbaik ${st.best_score}/${topic.questions.length})` : ""} |`);
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
    for (const m of topic.university) L.push(`- **${m.module}**, ${m.institution}, [${m.programme}](${m.url})${m.catalogue ? ` (${m.catalogue})` : ""}`);
    L.push("");
  }
  L.push("## Inti materi", "");
  topic.points.forEach((p, i) => L.push(`${i + 1}. ${p}`));
  L.push("");
  L.push("## Sumber", "");
  L.push("| Jenis | Sumber | Asal dan tahun | Keterangan |", "|---|---|---|---|");
  for (const s of topic.sources) L.push(`| ${KIND[s.kind] || s.kind} | [${s.title}](${s.url}) | ${[s.publisher, s.year].filter(Boolean).join(", ")}${s.accreditation ? ` (${s.accreditation}${s.exempt ? `, ${s.exempt}` : ""})` : ""} | ${s.description || ""} |`);
  L.push("");
  L.push("## Kuis (tanpa kunci jawaban)", "");
  topic.questions.forEach((q, i) => {
    L.push(`${i + 1}. ${q.stem}`);
    q.options.forEach((o, j) => L.push(`   - ${String.fromCharCode(65 + j)}. ${o}`));
  });
  L.push("", "---", "", `_EasyLearnn, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}._`, "");
  return L.join("\n");
}

/** Blok PDF untuk satu topik. */
export function topicToBlocks(topic: Topic, content: Content, progress: Progress): Block[] {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const st = topicStatus(progress, topic.slug);
  const B: Block[] = [];
  B.push({ type: "title", text: topic.title });
  B.push({ type: "small", text: `${topic.curriculum_ref}  |  ${phase ? (phase.id === 0 ? phase.name : `Fase ${phase.id}: ${phase.name}`) : ""}  |  ${weekLabel(topic)}` });
  B.push({ type: "p", text: topic.summary });
  B.push({ type: "kv", key: "Kuis", value: `${st.quiz_passed ? "lulus" : "belum lulus"}${st.best_score != null ? ` (terbaik ${st.best_score}/${topic.questions.length}, ${st.attempts} kali)` : ""}` });
  B.push({ type: "kv", key: "Status topik", value: st.done ? "selesai" : "belum selesai (perlu kuis lulus)" });

  B.push({ type: "h1", text: "Acuan" });
  for (const u of topic.units) B.push({ type: "li", text: `${u.unit_code} ${u.unit_name}${u.is_core ? " (unit inti)" : ""}` });
  for (const m of topic.university) B.push({ type: "li", text: `${m.module}, ${m.institution}, ${m.programme}${m.catalogue ? ` (${m.catalogue})` : ""}` });

  B.push({ type: "h1", text: "Inti materi" });
  topic.points.forEach((p, i) => B.push({ type: "p", text: `${i + 1}. ${p}` }));

  B.push({ type: "h1", text: "Sumber" });
  for (const s of topic.sources) B.push({ type: "li", text: `[${KIND[s.kind] || s.kind}] ${s.title}. ${[s.publisher, s.year].filter(Boolean).join(", ")}${s.accreditation ? ` (${s.accreditation}${s.exempt ? `, ${s.exempt}` : ""})` : ""}. ${s.url}` });
  return B;
}

/** Rangkuman teks biasa untuk satu topik, berpoin, tanpa simbol Markdown. */
export function topicToText(topic: Topic, content: Content, progress: Progress): string {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const st = topicStatus(progress, topic.slug);
  const L: string[] = [];
  L.push(topic.title.toUpperCase(), "");
  L.push(topic.summary, "");
  L.push(`Acuan kurikulum : ${topic.curriculum_ref}`);
  if (phase) L.push(`Fase            : ${phase.id === 0 ? phase.name : `${phase.id}. ${phase.name}`}`);
  L.push(`Jadwal          : ${weekLabel(topic)}`);
  L.push(`Kuis            : ${st.quiz_passed ? "lulus" : "belum lulus"}${st.best_score != null ? ` (terbaik ${st.best_score} dari ${topic.questions.length})` : ""}`);
  L.push(`Status topik    : ${st.done ? "selesai" : "belum selesai"}`, "");

  L.push("ACUAN", "");
  L.push("Unit kompetensi AQF (SIT50322):");
  for (const u of topic.units) L.push(`  • ${u.unit_code} ${u.unit_name}${u.is_core ? " (unit inti)" : ""}`, `      ${u.url}`);
  if (topic.university.length) {
    L.push("Modul kampus pembanding:");
    for (const m of topic.university) L.push(`  • ${m.module}, ${m.institution}, ${m.programme}${m.catalogue ? ` (${m.catalogue})` : ""}`, `      ${m.url}`);
  }
  L.push("");
  L.push("INTI MATERI", "");
  topic.points.forEach((pt, i) => L.push(`  ${i + 1}. ${pt}`));
  L.push("");
  L.push("SUMBER", "");
  for (const src of topic.sources) {
    L.push(`  • [${KIND[src.kind] || src.kind}] ${src.title}`);
    if (src.publisher || src.year) L.push(`      Asal: ${[src.publisher, src.year].filter(Boolean).join(", ")}${src.accreditation ? ` (${src.accreditation}${src.exempt ? `, ${src.exempt}` : ""})` : ""}`);
    if (src.description) L.push(`      ${src.description}`);
    L.push(`      ${src.url}`);
  }
  L.push("", "KUIS (TANPA KUNCI JAWABAN)", "");
  topic.questions.forEach((q, i) => {
    L.push(`  ${i + 1}. ${q.stem}`);
    q.options.forEach((o, j) => L.push(`     ${String.fromCharCode(65 + j)}. ${o}`));
    L.push("");
  });
  L.push(`EasyLearnn, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}.`, "");
  return L.join("\n");
}

/** Recap hasil belajar (skor kuis semua modul) dalam Markdown. */
export function recapToMarkdown(content: Content, progress: Progress): string {
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const L: string[] = [];
  L.push("# Recap hasil belajar", "");
  L.push(`Program belajar event management Enter Event House, 6 fase, ${content.program_weeks} minggu.`, "");
  L.push("| | |", "|---|---|");
  L.push(`| Nama | ${progress.settings.display_name || "-"} |`);
  L.push(`| Mulai program | ${progress.settings.program_start ? formatYmd(progress.settings.program_start, true) : "-"} |`);
  L.push(`| Topik selesai | ${sum.done} dari ${sum.total} |`);
  L.push(`| Kuis lulus | ${sum.quiz} |`);
  L.push(`| Hari belajar tercatat | ${progress.study_days.length} |`, "");
  L.push("## Ringkasan per topik", "");
  L.push("| Jadwal | Topik | Kuis | Skor terbaik | Status |", "|---|---|---|---|---|");
  for (const t of ordered) {
    const st = statuses[t.slug];
    L.push(`| ${weekLabel(t).replace("Minggu ", "M").replace(" sampai ", "-")} | ${t.title} | ${st.quiz_passed ? "lulus" : "belum"} | ${st.best_score != null ? `${st.best_score}/${t.questions.length}` : "-"} | ${st.done ? "selesai" : "belum"} |`);
  }
  L.push("");
  L.push("---", "", `_EasyLearnn, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}._`, "");
  return L.join("\n");
}

/** Blok PDF recap hasil belajar (skor kuis semua modul). */
export function recapToBlocks(content: Content, progress: Progress): Block[] {
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const B: Block[] = [];
  B.push({ type: "title", text: "Recap hasil belajar" });
  B.push({ type: "small", text: `Program belajar event management Enter Event House, 6 fase, ${content.program_weeks} minggu. Acuan AQF SIT50322 Diploma of Event Management.` });
  B.push({ type: "kv", key: "Nama", value: progress.settings.display_name || "-" });
  B.push({ type: "kv", key: "Mulai program", value: progress.settings.program_start ? formatYmd(progress.settings.program_start, true) : "-" });
  B.push({ type: "kv", key: "Topik selesai", value: `${sum.done} dari ${sum.total}` });
  B.push({ type: "kv", key: "Hari belajar tercatat", value: String(progress.study_days.length) });

  B.push({ type: "h1", text: "Ringkasan per topik" });
  for (const t of ordered) {
    const st = statuses[t.slug];
    B.push({ type: "li", text: `${weekLabel(t)}: ${t.title}. Kuis ${st.quiz_passed ? "lulus" : "belum"}${st.best_score != null ? ` (${st.best_score}/${t.questions.length})` : ""}, ${st.done ? "selesai" : "belum selesai"}.` });
  }
  return B;
}

/** Recap hasil belajar sebagai teks biasa berpoin. */
export function recapToText(content: Content, progress: Progress): string {
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const L: string[] = [];
  L.push("RECAP HASIL BELAJAR", "");
  L.push(`Program belajar event management Enter Event House, 6 fase, ${content.program_weeks} minggu. Acuan AQF SIT50322 Diploma of Event Management.`, "");
  L.push(`Nama                  : ${progress.settings.display_name || "-"}`);
  L.push(`Mulai program         : ${progress.settings.program_start ? formatYmd(progress.settings.program_start, true) : "-"}`);
  L.push(`Topik selesai         : ${sum.done} dari ${sum.total}`);
  L.push(`Kuis lulus            : ${sum.quiz}`);
  L.push(`Hari belajar tercatat : ${progress.study_days.length}`, "");
  L.push("RINGKASAN PER TOPIK", "");
  for (const t of ordered) {
    const st = statuses[t.slug];
    L.push(`  • ${weekLabel(t)}: ${t.title}`);
    L.push(`      Kuis ${st.quiz_passed ? "lulus" : "belum"}${st.best_score != null ? ` (${st.best_score}/${t.questions.length})` : ""}, ${st.done ? "selesai" : "belum selesai"}`);
  }
  L.push("", `EasyLearnn, Enter Event House. Dibuat ${formatYmd(new Date().toISOString().slice(0, 10), true)}.`, "");
  return L.join("\n");
}
