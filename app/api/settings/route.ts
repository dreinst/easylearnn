import { NextResponse } from "next/server";
import { DataError, patchSettings } from "@/lib/data";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const allowed = ["display_name", "timezone", "program_start", "remind_time", "remind_push"] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  try {
    return NextResponse.json(await patchSettings(patch));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof DataError ? e.status : 500 });
  }
}
