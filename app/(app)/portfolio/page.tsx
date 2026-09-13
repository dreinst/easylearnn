import { getContent, getProgress } from "@/lib/data";
import { overall, statusMap } from "@/lib/status";
import EvidenceList from "@/components/EvidenceList";
import QuickView from "@/components/QuickView";
import { portfolioToMarkdown } from "@/lib/export";
import { markdownToHtml } from "@/lib/mdhtml";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const [content, progress] = await Promise.all([getContent(), getProgress()]);
  const statuses = statusMap(content, progress);
  const sum = overall(content, statuses);
  const titles = Object.fromEntries(content.topics.map((t) => [t.slug, t.title]));
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  const items = progress.evidence.map((e) => ({ ...e, topic_title: titles[e.topic] || e.topic })).sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
  const missing = ordered.filter((t) => !statuses[t.slug].evidence_done);
  const summaryHtml = markdownToHtml(portfolioToMarkdown(content, progress));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold text-navy">Portfolio bukti kerja</h1>
        <p className="mt-1 text-sm text-mute">Kumpulan bukti kerja dari event nyata untuk dibawa ke uji kompetensi BNSP. Semua tersimpan sebagai berkas di folder jurnal di VPS.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickView
            title="Rangkuman portfolio"
            html={summaryHtml}
            downloads={[
              { label: "Unduh portfolio (PDF)", href: "/api/portfolio/pdf", primary: true },
              { label: "Unduh rangkuman", href: "/api/portfolio/export" },
            ]}
          />
          <a href="/api/portfolio/pdf" className="btn-navy text-xs">Unduh PDF</a>
          <a href="/api/portfolio/export" className="btn-ghost text-xs">Unduh rangkuman</a>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span><b>{items.length}</b> bukti kerja</span>
          <span><b>{sum.evidence}</b> dari {sum.total} topik punya bukti</span>
          <span><b>{sum.done}</b> topik selesai (kuis lulus + bukti)</span>
        </div>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold text-navy">Semua bukti kerja</h2>
        {items.length ? <EvidenceList items={items} showTopic /> : <p className="mt-2 text-sm text-mute">Belum ada. Bukti kerja diunggah dari halaman tiap topik.</p>}
      </section>

      {missing.length > 0 && (
        <section className="card">
          <h2 className="text-lg font-semibold text-navy">Topik yang belum punya bukti kerja</h2>
          <ul className="mt-2 grid gap-1 text-sm md:grid-cols-2">
            {missing.map((t) => <li key={t.slug}><a className="hover:underline" href={`/topic/${t.slug}#bukti`}>{t.title}</a></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
