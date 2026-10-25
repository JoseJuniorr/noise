import { describe, expect, it } from "vitest";
import { slugify, splitList, toTags } from "./tag";

describe("tags", () => {
  it("gera o endereço sem acento nem pontuação", () => {
    expect(slugify("  Música ao vivo! ")).toBe("musica-ao-vivo");
  });

  it("junta tags repetidas e descarta vazias", () => {
    expect(toTags(["Rock", "rock ", "", "Ao vivo"])).toEqual([
      { name: "Rock", slug: "rock" },
      { name: "Ao vivo", slug: "ao-vivo" },
    ]);
  });

  it("lê palavras-chave separadas por vírgula ou em lista", () => {
    expect(splitList("rock, Ao vivo , ,rock")).toEqual(["rock", "Ao vivo"]);
    expect(splitList(["a", " b "])).toEqual(["a", "b"]);
    expect(splitList(null)).toEqual([]);
  });
});
