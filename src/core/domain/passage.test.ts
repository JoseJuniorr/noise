import { describe, expect, it } from "vitest";
import { joinNames, parsePassageName } from "./passage";

describe("parsePassageName", () => {
  it("sem nome é anônimo", () => {
    expect(parsePassageName(undefined)).toEqual({ ok: true, name: undefined });
    expect(parsePassageName("   ")).toEqual({ ok: true, name: undefined });
  });

  it("aceita nomes com acento, apóstrofo, hífen e ponto, limpando espaços", () => {
    expect(parsePassageName("  João   d'Ávila-Neto ")).toEqual({ ok: true, name: "João d'Ávila-Neto" });
    expect(parsePassageName("J. R.")).toEqual({ ok: true, name: "J. R." });
  });

  it.each(["https://spam.com", "www.loja.com", "ana@email.com", "Ana 1234", "🔥🔥", "a".repeat(40), "<script>"])(
    "recusa o que não parece nome: %s",
    (raw) => {
      expect(parsePassageName(raw).ok).toBe(false);
    },
  );
});

describe("joinNames", () => {
  it("junta como se fala", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames(["Ana"])).toBe("Ana");
    expect(joinNames(["Ana", "Pedro"])).toBe("Ana e Pedro");
    expect(joinNames(["Ana", "Pedro", "Lu"])).toBe("Ana, Pedro e Lu");
  });
});
