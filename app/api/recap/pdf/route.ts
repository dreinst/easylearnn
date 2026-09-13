import { getContent, getProgress } from "@/lib/data";
import { recapToBlocks } from "@/lib/export";
import { renderPdf } from "@/lib/pdf";

export async function GET(req: Request) {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const pdf = await renderPdf(recapToBlocks(content, progress), "EasyLearnn: Recap hasil belajar");
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${inline ? "inline" : "attachment"}; filename="recap.pdf"`,
    },
  });
}
