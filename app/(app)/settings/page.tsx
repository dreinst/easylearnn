import { getProgress, getPushPublicKey } from "@/lib/data";
import SettingsForm from "@/components/SettingsForm";
import PushButton from "@/components/PushButton";

export const metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const progress = await getProgress();
  const push = await getPushPublicKey().catch(() => ({ key: "", enabled: false }));
  const s = progress.settings;
  const lastReminders = [...progress.reminder_log].slice(-5).reverse();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-navy">Pengaturan</h1>
      <SettingsForm settings={s} />

      <section className="card">
        <h2 className="text-lg font-semibold text-navy">Notifikasi push</h2>
        <p className="mt-1 text-sm text-mute">
          Pengingat dikirim pukul {s.remind_time} ({s.timezone}) ke semua perangkat yang diaktifkan, hanya kalau hari itu belum ada kuis atau bukti kerja.
          Perangkat terdaftar: {progress.push_subscriptions.length}.
        </p>
        <div className="mt-3"><PushButton publicKey={push.key} enabled={push.enabled} /></div>
        {lastReminders.length > 0 && (
          <div className="mt-4">
            <div className="label">Log pengingat terakhir</div>
            <ul className="space-y-1 font-mono text-xs text-mute">
              {lastReminders.map((l, i) => <li key={i}>{l.day} · {l.status}{l.detail ? ` · ${l.detail}` : ""}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-navy">WhatsApp</h2>
        <p className="mt-1 text-sm text-mute">Pengingat WhatsApp dikerjakan setelah template pesan didaftarkan ke Meta. Sampai saat itu, pakai notifikasi push.</p>
      </section>
    </div>
  );
}
