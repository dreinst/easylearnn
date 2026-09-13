"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Evidence } from "@/lib/types";

export default function EvidenceList({ items, showTopic }: { items: (Evidence & { topic_title?: string })[]; showTopic?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("Hapus bukti kerja ini dari jurnal? Berkas lampirannya ikut terhapus.")) return;
    setBusy(id);
    await fetch(`/api/evidence/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  if (!items.length) return <p className="mt-3 text-sm text-mute">Belum ada bukti kerja untuk topik ini.</p>;
  return (
    <ul className="mt-3 divide-y divide-line">
      {items.map((e) => (
        <li key={e.id} className="py-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-navy">{e.title}</span>
            {showTopic && e.topic_title && <span className="badge-orange">{e.topic_title}</span>}
            <span className="font-mono text-xs text-mute">{e.submitted_at.slice(0, 10)}</span>
            <button className="ml-auto text-xs text-mute hover:text-red-700" onClick={() => remove(e.id)} disabled={busy === e.id}>hapus</button>
          </div>
          {e.note && <p className="mt-1 whitespace-pre-wrap text-sm">{e.note}</p>}
          <div className="mt-1 flex flex-wrap gap-3 text-xs">
            {e.link && <a className="text-orange-2 hover:underline" href={e.link} target="_blank" rel="noreferrer">Buka tautan</a>}
            {e.file && <a className="text-orange-2 hover:underline" href={`/api/files/${encodeURIComponent(e.file)}`}>Unduh lampiran</a>}
            <span className="font-mono text-mute">jurnal/{e.journal_file}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
