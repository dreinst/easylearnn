import { getContent, getProgress } from "@/lib/data";
import { portfolioToMarkdown } from "@/lib/export";
import { previewPage } from "@/lib/mdhtml";

export async function GET(req: Request) {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const md = portfolioToMarkdown(content, progress);
  if (new URL(req.url).searchParams.get("inline") === "1") {
    return new Response(previewPage("Portfolio bukti kerja", md, "/api/portfolio/export"), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="portfolio.md"`,
    },
  });
}
