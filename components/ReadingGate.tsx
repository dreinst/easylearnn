"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Pembatas baca: kuis baru terbuka setelah materi dibaca dengan waktu minimal
 * (dihitung dari jumlah kata, patokan 300 kata per menit, jadi pembaca cepat tetap lolos)
 * dan halaman digulir sampai bagian ini. Waktu hanya dihitung saat tab terlihat.
 * Kemajuan disimpan di perangkat supaya muat ulang tidak mengulang dari nol.
 */
const WPM = 300;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m} menit ${r} detik` : `${r} detik`;
}

export default function ReadingGate({ slug, words, alreadyPassed, children }: { slug: string; words: number; alreadyPassed: boolean; children: React.ReactNode }) {
  const required = Math.max(45, Math.round((words / WPM) * 60));
  const key = `pb-read-${slug}`;
  const [state, setState] = useState({ elapsed: 0, ready: alreadyPassed });
  const reachedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alreadyPassed) return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) reachedRef.current = true; }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    let elapsed = 0;
    let finished = false;
    // Pulihkan kemajuan dari perangkat (di luar badan effect agar tidak memicu render berantai).
    const load = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        if (saved.done) { finished = true; setState({ elapsed: saved.elapsed || 0, ready: true }); return; }
        if (typeof saved.elapsed === "number") { elapsed = saved.elapsed; setState({ elapsed, ready: false }); }
      } catch {}
    }, 0);
    const timer = setInterval(() => {
      if (finished || document.visibilityState !== "visible") return;
      elapsed += 1;
      const ready = elapsed >= required && reachedRef.current;
      if (ready) finished = true;
      try { localStorage.setItem(key, JSON.stringify(ready ? { done: true, elapsed } : { elapsed })); } catch {}
      setState({ elapsed, ready });
    }, 1000);
    return () => { clearTimeout(load); clearInterval(timer); io.disconnect(); };
  }, [alreadyPassed, key, required]);

  if (state.ready) return <>{children}</>;
  const remaining = Math.max(0, required - state.elapsed);
  const pct = Math.min(100, Math.round((state.elapsed / required) * 100));
  return (
    <div ref={ref} className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-warn">Kuis belum terbuka</span>
        <span className="text-sm">Baca materi di atas dengan tenang. Kuis terbuka setelah waktu baca minimal terpenuhi dan bagian ini sudah tergulir.</span>
      </div>
      <div className="mt-3 h-2 w-full rounded bg-amber-200"><div className="h-2 rounded bg-orange transition-all" style={{ width: `${pct}%` }} /></div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-amber-900">
        <span>Materi sekitar {words} kata, waktu baca minimal {fmt(required)}.</span>
        <span>{remaining > 0 ? `Sisa ${fmt(remaining)}.` : "Waktu terpenuhi."}</span>
        <span>Penghitung hanya berjalan saat halaman ini terlihat.</span>
      </div>
    </div>
  );
}
