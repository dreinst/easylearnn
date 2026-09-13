import { getAttachment, DataError } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  try {
    const { bytes } = await getAttachment(name);
    const original = name.replace(/^[0-9a-f]{8}-/, "");
    return new Response(bytes, {
      headers: { "content-type": "application/octet-stream", "content-disposition": `attachment; filename="${original}"` },
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: e instanceof DataError ? e.status : 500 });
  }
}
