"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function reset() {
    if (!window.confirm("Kembalikan seluruh konten ke seed dari repo? Semua edit admin hilang. Progres belajar tidak terpengaruh.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/content/reset", { method: "POST" });
    setBusy(false);
    setMsg(res.ok ? "Konten dikembalikan ke seed." : "Gagal.");
    router.refresh();
  }
  return (
    <div className="mt-3 flex items-center gap-3">
      <button className="btn-ghost" onClick={reset} disabled={busy}>Kembalikan ke seed</button>
      {msg && <span className="text-sm text-mute">{msg}</span>}
    </div>
  );
}
