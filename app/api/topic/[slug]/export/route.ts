import { getContent, getProgress } from "@/lib/data";
import { findTopic } from "@/lib/status";
import { topicToText } from "@/lib/export";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const topic = findTopic(content, slug);
  if (!topic) return Response.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  return new Response(topicToText(topic, content, progress), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}-rangkuman.txt"`,
    },
  });
}
