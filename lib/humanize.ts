/**
 * Bersihkan tanda pisah (em dash, en dash, double hyphen) dari teks keluaran AI.
 * Blok kode dan tautan dibiarkan.
 */
export function stripDashes(text: string): string {
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // blok kode
      return part
        .replace(/\s*[—–]\s*/g, ", ")
        .replace(/(\S)\s+--\s+(\S)/g, "$1, $2")
        .replace(/(\S)--(\S)/g, "$1, $2")
        .replace(/^\s*--\s*/gm, "")
        .replace(/, ,/g, ",")
        .replace(/,\s*([.!?])/g, "$1");
    })
    .join("");
}
