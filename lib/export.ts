import type { Content, Topic } from "./types";

export function topicToMarkdown(topic: Topic, content: Content): string {
  const phase = content.phases.find((p) => p.id === topic.phase_id);
  const lines: string[] = [];
  lines.push(`# ${topic.title}`);
  lines.push("");
  lines.push(`Acuan kurikulum: ${topic.curriculum_ref}`);
  if (phase) lines.push(`Fase: ${phase.name}${topic.week_from ? ` (minggu ${topic.week_from}${topic.week_to !== topic.week_from ? ` sampai ${topic.week_to}` : ""})` : " (sepanjang program)"}`);
  lines.push("");
  lines.push(topic.summary);
  lines.push("");
  lines.push("## Acuan unit kompetensi AQF");
  lines.push("");
  for (const u of topic.units) lines.push(`- ${u.unit_code} ${u.unit_name}${u.is_core ? " (inti)" : ""}: ${u.url}`);
  if (topic.university.length) {
    lines.push("");
    lines.push("## Acuan modul kampus");
    lines.push("");
    for (const m of topic.university) lines.push(`- ${m.institution}, ${m.programme}: ${m.module} (${m.url})`);
  }
  lines.push("");
  lines.push("## Inti materi");
  lines.push("");
  for (const p of topic.points) lines.push(`- ${p}`);
  lines.push("");
  lines.push("## Bukti kerja");
  lines.push("");
  lines.push(topic.evidence_brief);
  lines.push("");
  lines.push("## Sumber");
  lines.push("");
  for (const s of topic.sources) lines.push(`- ${s.title}: ${s.url}${s.description ? `\n  ${s.description}` : ""}`);
  lines.push("");
  lines.push("## Kuis (tanpa kunci jawaban)");
  lines.push("");
  topic.questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.stem}`);
    q.options.forEach((o, j) => lines.push(`   ${String.fromCharCode(65 + j)}. ${o}`));
    lines.push("");
  });
  return lines.join("\n");
}
