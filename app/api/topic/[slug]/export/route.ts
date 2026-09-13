import { getContent } from "@/lib/data";
import { findTopic } from "@/lib/status";
import { topicToMarkdown } from "@/lib/export";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const topic = findTopic(content, slug);
  if (!topic) return Response.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const md = topicToMarkdown(topic, content);
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.md"`,
    },
  });
}
