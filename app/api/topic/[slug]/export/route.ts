import { getContent, getProgress } from "@/lib/data";
import { findTopic } from "@/lib/status";
import { topicToMarkdown } from "@/lib/export";
import { previewPage } from "@/lib/mdhtml";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const topic = findTopic(content, slug);
  if (!topic) return Response.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const md = topicToMarkdown(topic, content, progress);
  if (new URL(req.url).searchParams.get("inline") === "1") {
    return new Response(previewPage(topic.title, md, `/api/topic/${slug}/export`), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.md"`,
    },
  });
}
