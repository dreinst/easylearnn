"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";

const TIMEZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "Asia/Kuala_Lumpur"];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({ display_name: settings.display_name, timezone: settings.timezone, program_start: settings.program_start ?? "", remind_time: settings.remind_time, remind_push: settings.remind_push });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [resetStep, setResetStep] = useState(0);
  const [confirmText, setConfirmText] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(""); setError("");
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (!res.ok) { const b = await res.json().catch(() => ({})); setError(b.error || "Gagal menyimpan"); return; }
    setMsg("Tersimpan.");
    router.refresh();
  }

  async function reset() {
    setBusy(true); setError("");
    const res = await fetch("/api/settings/reset", { method: "POST" });
    setBusy(false);
    if (!res.ok) { setError("Gagal mereset"); return; }
    router.push("/roadmap");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={save} className="card grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nama panggilan</label>
          <input id="name" className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="tz">Zona waktu</label>
          <select id="tz" className="input" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            {[...new Set([settings.timezone, ...TIMEZONES])].map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="start">Tanggal mulai program</label>
          <input id="start" type="date" className="input" value={form.program_start} onChange={(e) => setForm({ ...form, program_start: e.target.value })} required />
          <p className="mt-1 text-xs text-mute">Mengubah tanggal menggeser timeline. Progres tidak hilang.</p>
        </div>
        <div>
          <label className="label" htmlFor="remind">Jam pengingat</label>
          <input id="remind" type="time" className="input" value={form.remind_time} onChange={(e) => setForm({ ...form, remind_time: e.target.value })} required />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.remind_push} onChange={(e) => setForm({ ...form, remind_push: e.target.checked })} />
            Kirim pengingat push
          </label>
        </div>
        {error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
        {msg && <p className="text-sm text-emerald-700 md:col-span-2">{msg}</p>}
        <div className="md:col-span-2"><button className="btn-accent" disabled={busy}>{busy ? "Menyimpan" : "Simpan"}</button></div>
      </form>

      <section className="card border-red-200">
        <h2 className="text-lg font-semibold text-red-800">Reset progres</h2>
        <p className="mt-1 text-sm text-mute">Menghapus semua hasil kuis dan hari belajar. Tanggal mulai dikosongkan. Pengaturan lain dan perangkat push tetap.</p>
        {resetStep === 0 && <button className="btn-danger mt-3" onClick={() => setResetStep(1)}>Reset progres</button>}
        {resetStep === 1 && (
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <input className="input" placeholder="Ketik HAPUS untuk konfirmasi" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            <button className="btn-danger" disabled={confirmText !== "HAPUS" || busy} onClick={reset}>Hapus semua progres</button>
            <button className="btn-ghost" onClick={() => { setResetStep(0); setConfirmText(""); }}>Batal</button>
          </div>
        )}
      </section>
    </>
  );
}
