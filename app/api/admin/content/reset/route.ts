import { NextResponse } from "next/server";
import { resetContent } from "@/lib/data";

export async function POST() {
  const c = await resetContent();
  return NextResponse.json({ ok: true, topics: c.topics.length });
}
