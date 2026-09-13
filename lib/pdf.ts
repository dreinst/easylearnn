import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

export type Block =
  | { type: "title"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "small"; text: string }
  | { type: "li"; text: string }
  | { type: "kv"; key: string; value: string }
  | { type: "hr" }
  | { type: "space"; size?: number };

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 50;
const NAVY = rgb(0x1b / 255, 0x2a / 255, 0x4a / 255);
const ORANGE = rgb(0xf0 / 255, 0x7e / 255, 0x1f / 255);
const INK = rgb(0.11, 0.12, 0.15);
const MUTE = rgb(0.42, 0.45, 0.5);

/** Helvetica memakai WinAnsi: buang karakter di luar itu (emoji, dll.) agar tidak error. */
function sanitize(text: string): string {
  return String(text ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/[^\x09\x0a\x20-\x7e\xa0-\xff•€]/g, "")
    .replace(/[ \t]+/g, " ");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(" ").filter(Boolean);
    if (!words.length) { lines.push(""); continue; }
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) line = test;
      else {
        if (line) lines.push(line);
        // kata yang lebih panjang dari baris dipotong paksa
        let chunk = w;
        while (font.widthOfTextAtSize(chunk, size) > maxWidth && chunk.length > 1) {
          let cut = chunk.length;
          while (cut > 1 && font.widthOfTextAtSize(chunk.slice(0, cut), size) > maxWidth) cut--;
          lines.push(chunk.slice(0, cut));
          chunk = chunk.slice(cut);
        }
        line = chunk;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderPdf(blocks: Block[], footer: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(footer);
  doc.setProducer("Production Book");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const width = A4[0] - MARGIN * 2;
  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - MARGIN;
  let pageNo = 1;

  const drawFooter = (p: PDFPage, n: number) => {
    const text = sanitize(`${footer}  |  hal. ${n}`);
    p.drawText(text, { x: MARGIN, y: 28, size: 8, font: regular, color: MUTE });
    p.drawRectangle({ x: MARGIN, y: 40, width, height: 0.5, color: rgb(0.85, 0.84, 0.8) });
  };
  const newPage = () => {
    drawFooter(page, pageNo);
    page = doc.addPage(A4);
    pageNo++;
    y = A4[1] - MARGIN;
  };
  const ensure = (h: number) => { if (y - h < MARGIN) newPage(); };

  const writeLines = (text: string, font: PDFFont, size: number, color = INK, indent = 0, bullet = false) => {
    const lines = wrap(sanitize(text), font, size, width - indent - (bullet ? 12 : 0));
    const lh = size * 1.38;
    lines.forEach((ln, i) => {
      ensure(lh);
      if (bullet && i === 0) page.drawText("•", { x: MARGIN + indent, y: y - size, size, font, color });
      page.drawText(ln, { x: MARGIN + indent + (bullet ? 12 : 0), y: y - size, size, font, color });
      y -= lh;
    });
  };

  for (const b of blocks) {
    switch (b.type) {
      case "title":
        ensure(40);
        page.drawRectangle({ x: MARGIN, y: y - 4, width: 28, height: 4, color: ORANGE });
        y -= 12;
        writeLines(b.text, bold, 20, NAVY);
        y -= 6;
        break;
      case "h1":
        y -= 8; ensure(30);
        writeLines(b.text, bold, 14, NAVY);
        page.drawRectangle({ x: MARGIN, y: y + 2, width, height: 0.6, color: rgb(0.85, 0.84, 0.8) });
        y -= 6;
        break;
      case "h2":
        y -= 4; ensure(22);
        writeLines(b.text, bold, 11, NAVY);
        y -= 2;
        break;
      case "p":
        writeLines(b.text, regular, 10.5);
        y -= 5;
        break;
      case "small":
        writeLines(b.text, regular, 8.5, MUTE);
        y -= 3;
        break;
      case "li":
        writeLines(b.text, regular, 10.5, INK, 6, true);
        y -= 2;
        break;
      case "kv": {
        const k = sanitize(b.key) + ": ";
        const kw = bold.widthOfTextAtSize(k, 10);
        ensure(14);
        page.drawText(k, { x: MARGIN, y: y - 10, size: 10, font: bold, color: INK });
        const lines = wrap(sanitize(b.value), regular, 10, width - kw);
        lines.forEach((ln, i) => {
          if (i > 0) { ensure(14); }
          page.drawText(ln, { x: MARGIN + kw, y: y - 10, size: 10, font: regular, color: INK });
          y -= 13.8;
        });
        break;
      }
      case "hr":
        y -= 4; ensure(8);
        page.drawRectangle({ x: MARGIN, y, width, height: 0.5, color: rgb(0.85, 0.84, 0.8) });
        y -= 8;
        break;
      case "space":
        y -= b.size ?? 8;
        break;
    }
  }
  drawFooter(page, pageNo);
  return doc.save();
}
