// Pengubah Markdown minimal (hanya untuk Markdown yang dibuat lib/export.ts) menjadi HTML pratinjau yang rapi.

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s.,)]|$)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noreferrer">$2</a>');
}

export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  const flushPara = (buf: string[]) => { if (buf.length) out.push(`<p>${buf.map(inline).join("<br>")}</p>`); buf.length = 0; };
  const para: string[] = [];
  while (i < lines.length) {
    const ln = lines[i];
    const h = ln.match(/^(#{1,3}) (.*)$/);
    if (h) { flushPara(para); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^---+$/.test(ln.trim())) { flushPara(para); out.push("<hr>"); i++; continue; }
    if (ln.startsWith("> ")) {
      flushPara(para);
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { q.push(lines[i].slice(2)); i++; }
      out.push(`<blockquote>${q.map(inline).join("<br>")}</blockquote>`);
      continue;
    }
    if (ln.startsWith("|")) {
      flushPara(para);
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      const hasHead = head && head.some((c) => c);
      out.push("<table>");
      if (hasHead) out.push(`<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`);
      out.push(`<tbody>${(hasHead ? body : rows).map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    if (/^\d+\. /.test(ln)) {
      flushPara(para);
      out.push("<ol>");
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        let item = inline(lines[i].replace(/^\d+\. /, ""));
        i++;
        const sub: string[] = [];
        while (i < lines.length && /^\s{2,}- /.test(lines[i])) { sub.push(inline(lines[i].replace(/^\s+- /, ""))); i++; }
        if (sub.length) item += `<ul>${sub.map((s) => `<li>${s}</li>`).join("")}</ul>`;
        out.push(`<li>${item}</li>`);
      }
      out.push("</ol>");
      continue;
    }
    if (/^- /.test(ln)) {
      flushPara(para);
      out.push("<ul>");
      while (i < lines.length && /^- /.test(lines[i])) { out.push(`<li>${inline(lines[i].slice(2))}</li>`); i++; }
      out.push("</ul>");
      continue;
    }
    if (!ln.trim()) { flushPara(para); i++; continue; }
    para.push(ln);
    i++;
  }
  flushPara(para);
  return out.join("\n");
}

export function previewPage(title: string, md: string, downloadHref: string): string {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root{color-scheme:light}
  body{margin:0;background:#f6f4ef;color:#1c1f26;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .bar{position:sticky;top:0;background:#1b2a4a;color:#fff;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .bar a{color:#fff;background:#f07e1f;padding:6px 12px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px}
  .bar span{font-size:13px;opacity:.8}
  main{max-width:820px;margin:0 auto;padding:24px 16px 64px;background:#fff}
  @media (min-width:900px){main{margin:24px auto;border:1px solid #e5e1d8;border-radius:10px;padding:40px 48px}}
  h1{color:#1b2a4a;font-size:28px;line-height:1.2;margin:0 0 12px}
  h2{color:#1b2a4a;font-size:20px;margin:28px 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e1d8}
  h3{color:#1b2a4a;font-size:16px;margin:20px 0 6px}
  blockquote{margin:12px 0;padding:10px 14px;border-left:4px solid #f07e1f;background:#fff7f0;border-radius:0 6px 6px 0}
  table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;display:block;overflow-x:auto}
  th,td{border:1px solid #e5e1d8;padding:6px 10px;text-align:left;vertical-align:top}
  th{background:#f6f4ef}
  ol,ul{padding-left:22px}li{margin:4px 0}
  a{color:#d96c0f}hr{border:0;border-top:1px solid #e5e1d8;margin:24px 0}
  em{color:#6b7280}
</style></head><body>
<div class="bar"><a href="${esc(downloadHref)}">Unduh .md</a><span>Pratinjau rangkuman. Berkas .md-nya bisa dibuka di Notion, Obsidian, atau GitHub.</span></div>
<main>${markdownToHtml(md)}</main></body></html>`;
}
