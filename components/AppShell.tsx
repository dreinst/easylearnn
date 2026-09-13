"use client";
import { useState } from "react";
import Link from "next/link";

export default function AppShell({ sidebar, streak, children }: { sidebar: React.ReactNode; streak: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* sidebar desktop */}
      <aside className="hidden w-[320px] shrink-0 bg-navy text-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebar}</div>
      </aside>

      {/* sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[86%] max-w-[340px] overflow-y-auto bg-navy text-white shadow-xl" onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("a")) setOpen(false);
          }}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/95 px-4 py-2 backdrop-blur lg:px-8">
          <button className="btn-ghost px-3 lg:hidden" aria-label="Buka rundown" onClick={() => setOpen(true)}>
            <span aria-hidden>☰</span> Rundown
          </button>
          <Link href="/" className="font-semibold text-navy lg:hidden">Production Book</Link>
          <div className="ml-auto flex items-center gap-3">
            {streak}
            <form action="/api/auth/logout" method="post">
              <button className="text-xs text-mute hover:text-navy">Keluar</button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
