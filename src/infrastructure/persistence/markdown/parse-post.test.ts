import { describe, expect, it } from "vitest";
import { InvalidPostError } from "@/core/domain/post";
import { parsePost } from "./parse-post";

const file = (meta: string, body = "Corpo.") => `---\n${meta}\n---\n${body}\n`;

describe("parsePost", () => {
  it("lê um texto simples, com kind text por padrão", () => {
    const post = parsePost("primeiro", file("date: 2026-10-12T23:41", "Um *caderno* aberto."));

    expect(post).toEqual({
      slug: "primeiro",
      publishedAt: "2026-10-12T23:41",
      title: undefined,
      kind: "text",
      html: "<p>Um <em>caderno</em> aberto.</p>",
    });
  });

  it("aceita data sem hora e título numérico", () => {
    const post = parsePost("disco", file("date: 2026-10-04\ntitle: 1984"));

    expect(post.publishedAt).toBe("2026-10-04");
    expect(post.title).toBe("1984");
  });

  it("mantém o bloco de código no html em registros de código", () => {
    const post = parsePost("trecho", file("date: 2026-10-09\nkind: code", "```ts\nconst a = 1;\n```"));

    expect(post.kind).toBe("code");
    expect(post.html).toContain('<pre><code class="language-ts">const a = 1;');
  });

  it("monta o acorde a partir do front-matter", () => {
    const post = parsePost("acorde", file("date: 2026-10-04\nkind: chord\nchord: Dadd9\nshape: x 5 4 2 3 0"));

    expect(post).toMatchObject({ kind: "chord", chord: { name: "Dadd9", shape: "x 5 4 2 3 0" } });
  });

  it("guarda só o id do Cloudinary nas fotos", () => {
    const post = parsePost(
      "ensaio",
      file("date: 2026-09-27\nkind: photo\nimage: noise/ensaio\nalt: Palco vazio depois do ensaio"),
    );

    expect(post).toMatchObject({
      kind: "photo",
      image: { publicId: "noise/ensaio", alt: "Palco vazio depois do ensaio" },
    });
  });

  it("lê capa e tratamento em qualquer forma", () => {
    const post = parsePost("capa", file("date: 2026-10-12\nimage: noise/capa\nfilter: vinheta\nratio: retrato"));

    expect(post.image).toEqual({
      publicId: "noise/capa",
      alt: "",
      treatment: { filter: "vinheta", ratio: "retrato", focus: "automatico" },
    });
  });

  it("aceita quebras de linha do Windows", () => {
    expect(parsePost("crlf", "---\r\ndate: 2026-10-12\r\n---\r\nOi.\r\n").html).toBe("<p>Oi.</p>");
  });

  it.each([
    ["sem front-matter", "Só texto."],
    ["sem data", file("title: Algo")],
    ["data fora do formato", file("date: 12/10/2026")],
    ["kind desconhecido", file("date: 2026-10-12\nkind: musica")],
    ["acorde sem nome", file("date: 2026-10-12\nkind: chord")],
    ["foto sem alt", file("date: 2026-10-12\nkind: photo\nimage: noise/x")],
    ["campo que não é texto", file("date: 2026-10-12\ntitle: [a, b]")],
  ])("rejeita registro %s, dizendo qual arquivo", (_, source) => {
    expect(() => parsePost("quebrado", source)).toThrow(InvalidPostError);
    expect(() => parsePost("quebrado", source)).toThrow(/"quebrado"/);
  });
});
