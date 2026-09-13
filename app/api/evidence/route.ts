import { NextResponse } from "next/server";
import { addEvidence, DataError, getContent, getProgress } from "@/lib/data";
import { lockInfo } from "@/lib/progression";
import { statusMap } from "@/lib/status";
import { findTopic } from "@/lib/status";

const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  const fd = await req.formData();
  const slug = String(fd.get("slug") || "");
  const content = await getContent();
  const topic = findTopic(content, slug);
  if (!topic) return NextResponse.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const lock = lockInfo(content, statusMap(content, await getProgress()), topic.slug);
  if (lock.locked) return NextResponse.json({ error: `Modul terkunci. Selesaikan dulu: ${lock.blocker?.title}` }, { status: 403 });
  const file = fd.get("file");
  let file_name: string | undefined;
  let file_base64: string | undefined;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Lampiran maksimal 3 MB" }, { status: 413 });
    file_name = file.name;
    file_base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  }
  try {
    const entry = await addEvidence({
      topic: slug,
      title: String(fd.get("title") || "").trim() || `Bukti kerja: ${topic.title}`,
      note: String(fd.get("note") || ""),
      link: String(fd.get("link") || "").trim() || null,
      file_name,
      file_base64,
    });
    return NextResponse.json(entry);
  } catch (e) {
    const status = e instanceof DataError ? e.status : 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
