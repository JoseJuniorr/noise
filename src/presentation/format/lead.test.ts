import { describe, expect, it } from "vitest";
import { leadParagraphs, splitLead, toPlainText } from "./lead";

describe("splitLead", () => {
  it("separa o primeiro parágrafo e avisa que há mais", () => {
    expect(splitLead("<p>Um.</p>\n<p>Dois.</p>")).toEqual({ lead: "<p>Um.</p>", hasMore: true });
  });

  it("não marca continuação quando o texto é um parágrafo só", () => {
    expect(splitLead("<p>Só isso.</p>\n")).toEqual({ lead: "<p>Só isso.</p>", hasMore: false });
  });

  it("trata citação e código como blocos inteiros", () => {
    expect(splitLead("<blockquote>\n<p>a</p>\n</blockquote>\n<p>b</p>").lead).toBe(
      "<blockquote>\n<p>a</p>\n</blockquote>",
    );
    expect(splitLead('<pre><code class="language-ts">x</code></pre><p>nota</p>').lead).toBe(
      '<pre><code class="language-ts">x</code></pre>',
    );
  });

  it("mostra inteiro o que não começa num bloco conhecido", () => {
    expect(splitLead("solto")).toEqual({ lead: "solto", hasMore: false });
  });
});

describe("toPlainText", () => {
  it("tira as tags e as entidades", () => {
    expect(toPlainText("<p>Um <em>caderno</em> &amp; nada</p>")).toBe("Um caderno & nada");
  });

  it("corta numa palavra inteira", () => {
    expect(toPlainText("<p>abrir um caderno em branco</p>", 14)).toBe("abrir um…");
  });
});

describe("leadParagraphs", () => {
  it("mantém os parágrafos separados enquanto cabem", () => {
    expect(leadParagraphs("<p>Um.</p>\n<p>Dois.</p>", 100)).toEqual(["Um.", "Dois."]);
  });

  it("corta só o último parágrafo, numa palavra inteira", () => {
    const html = "<p>" + "a ".repeat(40).trim() + "</p><p>" + "palavra ".repeat(30).trim() + "</p>";
    const result = leadParagraphs(html, 150);
    expect(result).toHaveLength(2);
    expect(result[1].endsWith("…")).toBe(true);
  });

  it("não começa um parágrafo novo para mostrar só um fiapo", () => {
    expect(leadParagraphs("<p>" + "x".repeat(90) + "</p><p>outro parágrafo comprido o bastante</p>", 100)).toEqual(["x".repeat(90)]);
  });
});
