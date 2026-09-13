"use client";
import { useEffect, useState } from "react";

type Download = { label: string; href: string; primary?: boolean };

/** Tombol "Lihat rangkuman": menampilkan rangkuman (HTML yang sudah dirender di server) di pop-up yang bisa di-scroll. */
export default function QuickView({ title, html, downloads }: { title: string; html: string; downloads: Download[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(true)}>Lihat rangkuman</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={title}>
          <div className="flex h-[92vh] w-full max-w-3xl flex-col rounded-t-xl bg-white shadow-2xl sm:h-[85vh] sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0 flex-1 truncate font-semibold text-navy">{title}</div>
              <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => setOpen(false)} aria-label="Tutup">Tutup</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
              <div className="md-view" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
              {downloads.map((d) => (
                <a key={d.href} href={d.href} className={`${d.primary ? "btn-navy" : "btn-ghost"} text-xs`}>{d.label}</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
