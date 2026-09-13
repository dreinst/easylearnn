import { NextResponse } from "next/server";
import { sendTestPush } from "@/lib/data";

export async function POST() {
  return NextResponse.json(await sendTestPush());
}
