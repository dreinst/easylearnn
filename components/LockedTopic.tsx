"use client";
import { useState } from "react";
import Link from "next/link";

/** Pop-up untuk topik yang masih terkunci: arahkan ke modul yang belum selesai. */
export default function LockedTopic({ title, blockerSlug, blockerTitle }: { title: string; blockerSlug: string; blockerTitle: string }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <div className="card border-amber-300 bg-amber-50">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-warn">Terkunci</span>
          <p className="min-w-0 flex-1 text-sm">Modul ini terbuka setelah <b>{blockerTitle}</b> selesai (kuis belum lulus).</p>
          <Link href={`/topic/${blockerSlug}`} className="btn-accent text-xs">Lanjutkan modul itu</Link>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Modul terkunci">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 inline-block h-1.5 w-8 rounded bg-accent" />
            <h2 className="text-lg font-bold text-navy">Selesaikan modul sebelumnya dulu</h2>
            <p className="mt-2 text-sm">
              <b>{title}</b> masih terkunci. Program dikerjakan berurutan: sebuah modul dianggap selesai kalau kuisnya sudah lulus.
            </p>
            <p className="mt-2 text-sm">Modul yang harus diselesaikan sekarang: <b>{blockerTitle}</b> (kuis belum lulus).</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/topic/${blockerSlug}`} className="btn-accent">Lanjutkan {blockerTitle.length > 28 ? "modul itu" : blockerTitle}</Link>
              <Link href="/" className="btn-ghost">Ke dashboard</Link>
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
