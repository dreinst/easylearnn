"use client";
import { useEffect, useState } from "react";

function b64ToUint8(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushButton({ publicKey, enabled }: { publicKey: string; enabled: boolean }) {
  const [state, setState] = useState<"unsupported" | "denied" | "off" | "on" | "loading">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(publicKey) });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }) });
      if (!res.ok) throw new Error("Server menolak subscription");
      setState("on");
      setMsg("Perangkat ini terdaftar.");
    } catch (e) {
      setMsg((e as Error).message || "Gagal mengaktifkan");
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setState("off");
    setMsg("Perangkat ini dilepas.");
  }

  async function test() {
    setMsg("Mengirim...");
    const res = await fetch("/api/push/test", { method: "POST" });
    const b = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Terkirim ke ${b.sent} perangkat${b.failed ? `, gagal ${b.failed}` : ""}.` : b.error || "Gagal");
  }

  if (!enabled || !publicKey) return <p className="text-sm text-amber-700">Kunci VAPID belum diisi di layanan VPS, push belum bisa dipakai.</p>;
  if (state === "loading") return <p className="text-sm text-mute">Memeriksa dukungan notifikasi...</p>;
  if (state === "unsupported") return <p className="text-sm text-amber-700">Browser ini belum mendukung Web Push. Di iPhone: pasang ke layar utama lewat Share, Add to Home Screen, lalu buka dari sana.</p>;
  if (state === "denied") return <p className="text-sm text-amber-700">Izin notifikasi ditolak. Ubah di pengaturan situs pada browser, lalu muat ulang.</p>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "off" ? (
        <button className="btn-orange" onClick={enable}>Aktifkan notifikasi di perangkat ini</button>
      ) : (
        <>
          <span className="badge-ok">Aktif di perangkat ini</span>
          <button className="btn-ghost" onClick={test}>Kirim notifikasi uji</button>
          <button className="btn-ghost" onClick={disable}>Matikan di perangkat ini</button>
        </>
      )}
      {msg && <span className="text-sm text-mute">{msg}</span>}
    </div>
  );
}
