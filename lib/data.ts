import "server-only";
import { cache } from "react";
import type { Content, Evidence, Progress, QuizAttempt, Settings } from "./types";

const BASE = (process.env.DATA_API_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DATA_TOKEN || "";

export class DataError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE || !TOKEN) throw new DataError(500, "DATA_API_URL atau DATA_TOKEN belum diisi di environment");
  const res = await fetch(BASE + path, {
    ...init,
    cache: "no-store",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) {
    let message = `Layanan data menjawab ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new DataError(res.status, message);
  }
  return res.json() as Promise<T>;
}

async function callRaw(path: string): Promise<{ bytes: ArrayBuffer; type: string }> {
  const res = await fetch(BASE + path, { cache: "no-store", headers: { authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new DataError(res.status, "Berkas tidak ditemukan");
  return { bytes: await res.arrayBuffer(), type: res.headers.get("content-type") || "application/octet-stream" };
}

// Dedup per request (layout + page memanggil keduanya).
export const getContent = cache(() => call<Content>("/content"));
export const getProgress = cache(() => call<Progress>("/progress"));

export const saveContent = (content: Content) => call<{ ok: true }>("/content", { method: "PUT", body: JSON.stringify(content) });
export const resetContent = () => call<Content>("/content/reset", { method: "POST" });

export const patchSettings = (patch: Partial<Settings>) => call<Settings>("/settings", { method: "PATCH", body: JSON.stringify(patch) });
export const resetProgress = () => call<{ ok: true }>("/progress/reset", { method: "POST" });

export const recordQuizAttempt = (data: { topic: string; answers: number[]; score: number; total: number; passed: boolean }) =>
  call<{ attempt: QuizAttempt; study_day: string }>("/quiz-attempts", { method: "POST", body: JSON.stringify(data) });

export const addEvidence = (data: { topic: string; title: string; note: string; link: string | null; file_name?: string; file_base64?: string }) =>
  call<Evidence>("/evidence", { method: "POST", body: JSON.stringify(data) });
export const deleteEvidence = (id: string) => call<{ ok: true }>(`/evidence/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getAttachment = (name: string) => callRaw(`/files/${encodeURIComponent(name)}`);

export const getPushPublicKey = () => call<{ key: string; enabled: boolean }>("/push/public-key");
export const addPushSubscription = (sub: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
  call<{ ok: true; count: number }>("/push/subscriptions", { method: "POST", body: JSON.stringify(sub) });
export const removePushSubscription = (endpoint: string) =>
  call<{ ok: true; count: number }>("/push/subscriptions", { method: "DELETE", body: JSON.stringify({ endpoint }) });
export const sendTestPush = () => call<{ sent: number; failed: number; removed: number; detail?: string }>("/push/test", { method: "POST" });
