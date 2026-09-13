import { getContent, getProgress } from "@/lib/data";
import { portfolioToBlocks } from "@/lib/export";
import { renderPdf } from "@/lib/pdf";

export async function GET(req: Request) {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const pdf = await renderPdf(portfolioToBlocks(content, progress), "Production Book: Portfolio bukti kerja");
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${inline ? "inline" : "attachment"}; filename="portfolio.pdf"`,
    },
  });
}
