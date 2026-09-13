"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

function renderInline(line: string) {
  // tebal **x** dan kode `x` sederhana
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="prose-pb text-sm">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*] /.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{renderInline(l.replace(/^\s*[-*] /, ""))}</li>)}</ul>;
        if (lines.every((l) => /^\s*\d+[.)] /.test(l))) return <ol key={i}>{lines.map((l, j) => <li key={j}>{renderInline(l.replace(/^\s*\d+[.)] /, ""))}</li>)}</ol>;
        return <p key={i}>{lines.map((l, j) => <span key={j}>{renderInline(l)}{j < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}

export default function Chatbot() {
  const pathname = usePathname();
  const slug = pathname.startsWith("/topic/") ? pathname.split("/")[2] : "";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError("");
    const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, slug }) });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(body.error || "Gagal"); return; }
    setMsgs([...next, { role: "assistant", content: body.reply }]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-orange px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-2"
        aria-label="Tanya AI"
      >
        {open ? "Tutup" : "Tanya AI"}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-40 flex h-[70vh] w-[min(420px,calc(100vw-2rem))] flex-col rounded-lg border border-line bg-white shadow-2xl">
          <div className="border-b border-line px-4 py-2">
            <div className="text-sm font-semibold text-navy">Tutor AI</div>
            <div className="text-[11px] text-mute">{slug ? `Konteks: topik ${slug}. ` : ""}Model Claude Haiku 4.5. Percakapan tidak disimpan.</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.length === 0 && <p className="text-sm text-mute">Tanya apa saja yang membingungkan dari materi: istilah, contoh penerapan di wedding, atau cara mengerjakan bukti kerja.</p>}
            {msgs.map((m, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 ${m.role === "user" ? "ml-6 bg-navy text-white" : "mr-6 bg-cream"}`}>
                {m.role === "user" ? <p className="whitespace-pre-wrap text-sm">{m.content}</p> : <Markdown text={m.content} />}
              </div>
            ))}
            {busy && <div className="mr-6 rounded-lg bg-cream px-3 py-2 text-sm text-mute">Sedang menulis...</div>}
            {error && <p className="text-sm text-red-700">{error}</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-line p-2">
            <input className="input" placeholder="Tulis pertanyaan" value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} autoFocus />
            <button className="btn-orange" disabled={busy || !input.trim()}>Kirim</button>
          </form>
        </div>
      )}
    </>
  );
}
