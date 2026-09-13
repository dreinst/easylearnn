// Pengubah Markdown minimal (hanya untuk Markdown yang dibuat lib/export.ts) menjadi HTML untuk pop-up lihat cepat.
// Dipakai di client (QuickView), jadi tanpa import server.

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
