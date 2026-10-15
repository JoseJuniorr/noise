import { describe, expect, it } from "vitest";
import { InvalidPostError } from "@/core/domain/post";
import { mapStrapiPost, type StrapiPost } from "./map-strapi-post";

const TZ = "America/Sao_Paulo";
const raw = (overrides: Partial<StrapiPost> = {}): StrapiPost => ({
  slug: "abrir-um-caderno",
  writtenAt: "2026-10-13T02:41:00.000Z",
  kind: "text",
  title: null,
  body: "Um *caderno* aberto.",
  ...overrides,
});

describe("mapStrapiPost", () => {
  it("traz o instante UTC de volta para a hora local de quem escreveu", () => {
    expect(mapStrapiPost(raw(), TZ)).toEqual({
      slug: "abrir-um-caderno",
      publishedAt: "2026-10-12T23:41",
      title: undefined,
      kind: "text",
      html: "<p>Um <em>caderno</em> aberto.</p>",
    });
  });

  it("monta o acorde a partir dos campos do painel", () => {
    const post = mapStrapiPost(raw({ kind: "chord", chordName: " Dadd9 ", chordShape: "x 5 4 2 3 0" }), TZ);
    expect(post).toMatchObject({ kind: "chord", chord: { name: "Dadd9", shape: "x 5 4 2 3 0" } });
  });

  it("guarda só o public_id do Cloudinary nas fotos", () => {
    const post = mapStrapiPost(
      raw({
        kind: "photo",
        body: null,
        image: { alternativeText: "Palco vazio", provider_metadata: { public_id: "noise/ensaio" } },
      }),
      TZ,
    );
    expect(post).toMatchObject({
      kind: "photo",
      html: "",
      image: { publicId: "noise/ensaio", alt: "Palco vazio" },
    });
  });

  it.each<[string, Partial<StrapiPost>]>([
    ["kind desconhecido", { kind: "musica" }],
    ["data inválida", { writtenAt: "ontem" }],
    ["acorde sem nome", { kind: "chord", chordName: "  " }],
    ["foto sem imagem", { kind: "photo", image: null }],
    ["foto sem texto alternativo", { kind: "photo", image: { provider_metadata: { public_id: "x" } } }],
  ])("rejeita %s, dizendo qual registro", (_, overrides) => {
    expect(() => mapStrapiPost(raw(overrides), TZ)).toThrow(InvalidPostError);
    expect(() => mapStrapiPost(raw(overrides), TZ)).toThrow(/"abrir-um-caderno"/);
  });
});
