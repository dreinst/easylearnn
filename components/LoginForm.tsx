"use client";
import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (res.ok) {
      window.location.href = next.startsWith("/") ? next : "/";
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Kode akses salah");
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <label className="label" htmlFor="code">Kode akses</label>
      <input
        id="code"
        type="password"
        className="input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="current-password"
        autoFocus
        required
      />
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button className="btn-orange mt-4 w-full" disabled={busy}>{busy ? "Memeriksa" : "Masuk"}</button>
      <p className="mt-3 text-xs text-mute">Kode akses diatur lewat variabel APP_ACCESS_CODE di Vercel.</p>
    </form>
  );
}
