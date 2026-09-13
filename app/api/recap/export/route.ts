import { getContent, getProgress } from "@/lib/data";
import { recapToText } from "@/lib/export";

export async function GET() {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  return new Response(recapToText(content, progress), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": 'attachment; filename="recap-rangkuman.txt"',
    },
  });
}
