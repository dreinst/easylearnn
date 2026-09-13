"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg p-8">
      <div className="card">
        <h1 className="text-lg font-semibold text-navy">Ada yang tidak beres</h1>
        <p className="mt-2 text-sm text-mute">{error.message || "Terjadi kesalahan."}</p>
        <p className="mt-2 text-sm text-mute">
          Coba muat ulang halaman. Kalau masih terjadi, tunggu sebentar lalu coba lagi.
        </p>
        <button className="btn-accent mt-4" onClick={reset}>Coba lagi</button>
      </div>
    </main>
  );
}
