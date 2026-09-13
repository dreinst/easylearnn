import { getContent, getProgress } from "@/lib/data";
import { findTopic } from "@/lib/status";
import { topicToBlocks } from "@/lib/export";
import { renderPdf } from "@/lib/pdf";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const topic = findTopic(content, slug);
  if (!topic) return Response.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const pdf = await renderPdf(topicToBlocks(topic, content, progress), `EasyLearnn: ${topic.title}`);
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${inline ? "inline" : "attachment"}; filename="${slug}.pdf"`,
    },
  });
}
