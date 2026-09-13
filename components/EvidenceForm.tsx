"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_MB = 3;

export default function EvidenceForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!note.trim() && !link.trim() && !file) {
      setError("Isi catatan, tautan, atau lampiran.");
      return;
    }
    if (file && file.size > MAX_MB * 1024 * 1024) {
      setError(`Lampiran maksimal ${MAX_MB} MB. Untuk berkas besar, unggah ke Drive lalu tempel tautannya.`);
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("title", title);
    fd.set("note", note);
    fd.set("link", link);
    if (file) fd.set("file", file);
    const res = await fetch("/api/evidence", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Gagal menyimpan bukti kerja");
      return;
    }
    setTitle(""); setNote(""); setLink(""); setFile(null);
    (e.target as HTMLFormElement).reset();
    setMsg("Bukti kerja tersimpan di jurnal. Hari belajar tercatat.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-md border border-dashed border-line p-4">
      <div className="text-sm font-semibold text-navy">Tambah bukti kerja</div>
      <div>
        <label className="label" htmlFor={`t-${slug}`}>Judul (nama event atau dokumen)</label>
        <input id={`t-${slug}`} className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Misal: Anggaran wedding R & A, Okt 2026" />
      </div>
      <div>
        <label className="label" htmlFor={`n-${slug}`}>Catatan (markdown boleh)</label>
        <textarea id={`n-${slug}`} className="input min-h-28" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Apa yang kamu buat, dari event mana, apa yang kamu pelajari." />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label" htmlFor={`l-${slug}`}>Tautan (Drive, Notion, dll.)</label>
          <input id={`l-${slug}`} type="url" className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className="label" htmlFor={`f-${slug}`}>Lampiran (maks {MAX_MB} MB)</label>
          <input id={`f-${slug}`} type="file" className="input" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      <div><button className="btn-navy" disabled={busy}>{busy ? "Menyimpan" : "Simpan ke jurnal"}</button></div>
    </form>
  );
}
