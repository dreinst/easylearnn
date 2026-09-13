import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getContent } from "@/lib/data";
import { findTopic } from "@/lib/status";
import { stripDashes } from "@/lib/humanize";

const MODEL = "claude-haiku-4-5";

const STYLE = `Kamu tutor pribadi untuk Donny, pemilik usaha event organizer dan wedding organizer di Indonesia yang sedang belajar event management memakai kurikulum Enter Event House dengan acuan unit kompetensi AQF SIT50322 dan modul kampus luar negeri.

Cara menjawab:
- Bahasa Indonesia yang wajar, seperti kolega berpengalaman yang menjelaskan langsung ke intinya. Contoh diambil dari dunia EO dan WO.
- Jawab pertanyaannya dulu, baru tambahan singkat kalau perlu. Panjang secukupnya, jangan bertele-tele.
- Kalau ditanya di luar materi, jawab singkat lalu arahkan kembali ke topik belajar.
- Jangan mengarang nama unit AQF, kode, atau sumber. Kalau tidak yakin, katakan tidak yakin.

Larangan gaya tulisan (wajib dipatuhi di seluruh keluaran):
- Jangan pernah memakai em dash, en dash, atau dua tanda hubung sebagai tanda pisah. Pakai koma, titik, atau tanda kurung.
- Jangan memakai pola "bukan X tapi Y" atau "bukan hanya X, melainkan Y".
- Jangan menutup jawaban dengan satu kalimat pendek yang mengulang poin.
- Jangan memaksakan tiga hal sejajar kalau isinya tidak tiga.
- Jangan memakai label tebal di tiap butir daftar, dan jangan memakai judul untuk jawaban pendek.
- Jangan memakai kata basa-basi seperti "Tentu!", "Pertanyaan bagus", atau menawarkan bantuan lanjutan di akhir.
- Hindari klaim yang dibesar-besarkan dan kata-kata seperti "krusial", "sangat penting", "landscape", "robust".`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI belum diaktifkan. Isi ANTHROPIC_API_KEY di Vercel (kunci API dari console.anthropic.com)." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const history = Array.isArray(body.messages) ? body.messages : [];
  const messages: Anthropic.MessageParam[] = history
    .filter((m: { role: string; content: string }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  }

  let context = "";
  if (body.slug) {
    const content = await getContent();
    const t = findTopic(content, String(body.slug));
    if (t) {
      context = `\n\nTopik yang sedang dibuka pengguna: "${t.title}" (${t.curriculum_ref}).\nRingkasan: ${t.summary}\nInti materi:\n${t.points.map((p) => `- ${p}`).join("\n")}\nBukti kerja yang diminta: ${t.evidence_brief}\nUnit AQF terkait: ${t.units.map((u) => `${u.unit_code} ${u.unit_name}`).join("; ")}\nModul kampus pembanding: ${t.university.map((m) => `${m.module} (${m.institution})`).join("; ")}`;
    }
  }

  const client = new Anthropic();
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: STYLE + context,
      messages,
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return NextResponse.json({ reply: stripDashes(text) });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "Kunci API Anthropic tidak valid" }, { status: 503 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Batas permintaan AI tercapai, coba lagi sebentar" }, { status: 429 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: `Layanan AI menjawab ${e.status}` }, { status: 502 });
    return NextResponse.json({ error: "Gagal menghubungi AI" }, { status: 502 });
  }
}
