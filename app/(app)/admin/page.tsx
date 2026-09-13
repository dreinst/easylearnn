import Link from "next/link";
import { getContent } from "@/lib/data";
import AdminActions from "@/components/AdminActions";

export const metadata = { title: "Admin konten" };

export default async function AdminPage() {
  const content = await getContent();
  const ordered = [...content.topics].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold text-navy">Admin konten</h1>
        <p className="mt-1 text-sm text-mute">Edit judul, materi, bukti kerja, unit, sumber, dan soal tanpa membuka kode. Perubahan tersimpan di content.json di VPS.</p>
        <AdminActions />
      </header>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-mute">
          <tr><th className="py-2">Minggu</th><th>Topik</th><th>Acuan</th><th className="text-right">Soal</th><th className="text-right">Sumber</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {ordered.map((t) => (
            <tr key={t.slug} className="bg-white">
              <td className="py-2 font-mono text-xs">{t.week_from ? `M${t.week_from}${t.week_to !== t.week_from ? `-${t.week_to}` : ""}` : "PB"}</td>
              <td><Link href={`/admin/${t.slug}`} className="font-medium text-navy hover:underline">{t.title}</Link></td>
              <td className="text-xs text-mute">{t.curriculum_ref}</td>
              <td className="text-right">{t.questions.length}</td>
              <td className="text-right">{t.sources.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
