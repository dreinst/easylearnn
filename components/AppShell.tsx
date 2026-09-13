"use client";
import { useState } from "react";
import BrandNav from "@/components/BrandNav";
import Icon from "@/components/Icon";

export function Aura() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
      <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-sky/10 blur-3xl" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="px-4 py-6 text-center text-xs font-semibold text-mute lg:px-8">
      Dibuat oleh Dreinst &middot; Diselenggarakan oleh D&apos;Production Event Organizer
    </footer>
  );
}

export default function AppShell({ sidebar, streak, userName, children }: { sidebar: React.ReactNode; streak: React.ReactNode; userName: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const initial = (userName.trim()[0] || "").toUpperCase();
  return (
    <div className="relative min-h-screen">
      <Aura />

      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/80 shadow-[0_1px_8px_rgb(0_0_0/0.04)] backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
          <button className="btn-ghost h-9 w-9 px-0 lg:hidden" aria-label="Buka silabus" onClick={() => setOpen(true)}>
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <BrandNav />
          <div className="ml-auto flex items-center gap-3">
            {streak}
            <div className="flex items-center gap-2 pl-1" title="Profil (segera hadir)">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {initial || <Icon name="user" className="h-4 w-4" />}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-bold text-navy">{userName || "Pembelajar"}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-mute">Crew D&apos;Production</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-72 overflow-y-auto bg-white/90 shadow-[1px_0_8px_rgb(0_0_0/0.04)] backdrop-blur-md lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside
            className="absolute inset-y-0 left-0 w-[86%] max-w-[340px] overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("a")) setOpen(false);
            }}
          >
            <div className="flex items-center justify-between px-6 pt-5">
              <span className="font-display text-lg font-bold text-navy">EasyLearnn</span>
              <button className="btn-ghost px-3 py-1 text-xs" onClick={() => setOpen(false)}>Tutup</button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative z-10 lg:pl-72">
        <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-28 pt-24 lg:px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
