// Primeiro bloco de topo do HTML (parágrafo, citação, lista, código, título).
const FIRST_BLOCK = /^\s*<(p|blockquote|pre|ul|ol|h[1-6])(?:\s[^>]*)?>[\s\S]*?<\/\1>/;

/**
 * Separa a abertura de um texto para o fluxo: o primeiro bloco, e se há mais
 * depois dele. HTML que não começa num bloco conhecido é mostrado inteiro.
 */
export function splitLead(html: string): { lead: string; hasMore: boolean } {
  const match = FIRST_BLOCK.exec(html);
  if (!match) return { lead: html, hasMore: false };
  return { lead: match[0].trim(), hasMore: html.slice(match[0].length).trim().length > 0 };
}

/** Texto corrido (sem tags) para descrições de página, cortado numa palavra inteira. */
export function toPlainText(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : maxLength)}…`;
}
