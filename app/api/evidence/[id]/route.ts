import { NextResponse } from "next/server";
import { deleteEvidence, DataError } from "@/lib/data";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteEvidence(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof DataError ? e.status : 500 });
  }
}
