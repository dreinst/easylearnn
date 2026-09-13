"use client";
import { useState } from "react";
import type { Source } from "@/lib/types";

const KIND: Record<string, string> = {
  aqf_unit: "Unit AQF", university: "Kampus", standard: "Standar", framework: "Kerangka", guide: "Panduan", certification: "Sertifikasi", course: "Kursus gratis", textbook: "Buku teks",
};

export default function SourceList({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="mt-3 divide-y divide-line">
      {sources.map((s) => (
        <li key={s.id} className="py-3 text-sm">
          <div className="flex flex-wrap items-start gap-2">
            <span className="badge-no shrink-0">{KIND[s.kind] || s.kind}</span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-navy">{s.title}</div>
              {s.description && <p className="text-xs text-mute">{s.description}</p>}
              {(s.publisher || s.year) && (
                <p className="mt-0.5 text-[11px] text-mute">
                  Sumber: {s.publisher}{s.year ? `, ${s.year}` : ""}{s.accreditation ? ` · ${s.accreditation}` : ""}{s.exempt ? ` · ${s.exempt}` : ""}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              {s.embeddable === true && (
                <button className="btn-ghost px-3 py-1 text-xs" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? "Tutup" : "Preview"}</button>
              )}
              <a className="btn-navy px-3 py-1 text-xs" href={s.url} target="_blank" rel="noreferrer">Buka</a>
            </div>
          </div>
          {open === s.id && (
            <iframe src={s.url} title={s.title} className="mt-3 h-[70vh] w-full rounded border border-line bg-white" loading="lazy" referrerPolicy="no-referrer" />
          )}
        </li>
      ))}
    </ul>
  );
}
