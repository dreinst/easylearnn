import { NextResponse } from "next/server";
import { getContent, getProgress, recordQuizAttempt } from "@/lib/data";
import { lockInfo } from "@/lib/progression";
import { statusMap } from "@/lib/status";
import { findTopic } from "@/lib/status";
import { gradeQuiz } from "@/lib/quiz";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const content = await getContent();
  const topic = findTopic(content, String(body.slug || ""));
  if (!topic) return NextResponse.json({ error: "Topik tidak ditemukan" }, { status: 404 });
  const lock = lockInfo(content, statusMap(content, await getProgress()), topic.slug);
  if (lock.locked) return NextResponse.json({ error: `Modul terkunci. Selesaikan dulu: ${lock.blocker?.title}` }, { status: 403 });
  let result;
  try {
    result = gradeQuiz(topic.questions, body.answers);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  await recordQuizAttempt({ topic: topic.slug, answers: body.answers, score: result.score, total: result.total, passed: result.passed });
  return NextResponse.json(result);
}
