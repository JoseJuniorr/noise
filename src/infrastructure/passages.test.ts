import { describe, expect, it } from "vitest";
import { passageLabel } from "@/presentation/format/passages";
import { InMemoryPassageRepository } from "./persistence/in-memory-passage-repository";
import { createRateLimiter } from "./rate-limit";

describe("InMemoryPassageRepository", () => {
  it("soma marcas por registro e devolve só os que têm marca", async () => {
    const repository = new InMemoryPassageRepository(new Map());

    expect(await repository.add("dadd9")).toBe(1);
    expect(await repository.add("dadd9")).toBe(2);
    expect(await repository.add("outro")).toBe(1);

    expect(await repository.counts(["dadd9", "outro", "vazio"])).toEqual({ dadd9: 2, outro: 1 });
  });
});

describe("createRateLimiter", () => {
  it("barra depois do limite e libera quando a janela passa", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });

    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 10)).toBe(true);
    expect(allow("ip", 20)).toBe(false);
    expect(allow("outro-ip", 20)).toBe(true);
    expect(allow("ip", 1015)).toBe(true);
  });
});

describe("passageLabel", () => {
  it("concorda o verbo com a contagem", () => {
    expect(passageLabel(1)).toBe("1 passou por aqui");
    expect(passageLabel(37)).toBe("37 passaram por aqui");
  });
});
