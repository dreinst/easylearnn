import { NextResponse } from "next/server";
import { addPushSubscription, removePushSubscription } from "@/lib/data";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) return NextResponse.json({ error: "Subscription tidak lengkap" }, { status: 400 });
  return NextResponse.json(await addPushSubscription({ endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth } }));
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.endpoint) return NextResponse.json({ error: "endpoint wajib" }, { status: 400 });
  return NextResponse.json(await removePushSubscription(body.endpoint));
}
