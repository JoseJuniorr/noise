import { Marked } from "marked";

// Conteúdo autoral (arquivos do repositório ou o painel do Strapi): o HTML não passa por sanitização.
const markdown = new Marked({ gfm: true });

/** Markdown → HTML, usado por todos os adaptadores para entregar `Post.html` igual. */
export function renderMarkdown(source: string): string {
  return (markdown.parse(source.trim(), { async: false }) as string).trim();
}
