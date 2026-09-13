import { NextResponse } from "next/server";
import { resetProgress } from "@/lib/data";

export async function POST() {
  return NextResponse.json(await resetProgress());
}
