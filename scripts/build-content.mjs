// Menyusun content/topics.json dari content/src/*. Jalankan: npm run build:content
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PHASES } from "../content/src/phases.mjs";
import { TOPICS_A } from "../content/src/topics-a.mjs";
import { TOPICS_B } from "../content/src/topics-b.mjs";
import { TOPICS_C } from "../content/src/topics-c.mjs";
import { unitSource } from "../content/src/units.mjs";
import { RESOURCES } from "../content/src/resources.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "..", "content", "topics.json");

const topics = [...TOPICS_A, ...TOPICS_B, ...TOPICS_C].map((t) => {
  const seen = new Set();
  const sources = [];
  const push = (s) => {
    if (seen.has(s.url)) return;
    seen.add(s.url);
    sources.push({ id: `${t.slug}-s${sources.length + 1}`, description: "", publisher: "", year: "", accreditation: "", embeddable: null, ...s });
  };
  for (const u of t.units) push(unitSource(u.unit_code));
  for (const m of t.university) push({ title: `${m.institution}: ${m.programme}`, description: `Modul acuan: ${m.module}.`, url: m.url, kind: "university", publisher: m.institution, year: m.catalogue, accreditation: "universitas terakreditasi" });
  for (const s of RESOURCES[t.slug] || []) push(s);
  for (const s of t.sources || []) push(s);
  const questions = t.questions.map((q, i) => ({ id: `${t.slug}-q${i + 1}`, ...q }));
  return { ...t, sources, questions };
});

const content = { version: 1, program_weeks: 24, phases: PHASES, topics };
writeFileSync(out, JSON.stringify(content, null, 2) + "\n");
const nq = topics.reduce((n, t) => n + t.questions.length, 0);
const ns = topics.reduce((n, t) => n + t.sources.length, 0);
console.log(`content/topics.json: ${topics.length} topik, ${nq} soal, ${ns} sumber`);
