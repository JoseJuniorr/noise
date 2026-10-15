import { describe, expect, it } from "vitest";
import { CatalogNumber, InvalidCatalogNumberError } from "./catalog-number";

describe("CatalogNumber", () => {
  describe("fromSequence", () => {
    it("formata com prefixo JQT e três dígitos", () => {
      expect(CatalogNumber.fromSequence(1).toString()).toBe("JQT-001");
      expect(CatalogNumber.fromSequence(42).toString()).toBe("JQT-042");
    });

    it("não trunca sequências acima de 999", () => {
      expect(CatalogNumber.fromSequence(1000).toString()).toBe("JQT-1000");
    });

    it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
      "rejeita sequência inválida %s",
      (sequence) => {
        expect(() => CatalogNumber.fromSequence(sequence)).toThrow(
          InvalidCatalogNumberError,
        );
      },
    );
  });

  describe("parse", () => {
    it("reconstrói o mesmo número a partir da string", () => {
      const parsed = CatalogNumber.parse("JQT-007");
      expect(parsed.sequence).toBe(7);
      expect(parsed.toString()).toBe("JQT-007");
    });

    it.each(["JQT-01", "jqt-001", "FAC-001", "JQT-000", "JQT-0010", "JQT-abc", ""])(
      "rejeita formato inválido %j",
      (value) => {
        expect(() => CatalogNumber.parse(value)).toThrow(InvalidCatalogNumberError);
      },
    );
  });

  it("compara por valor", () => {
    expect(CatalogNumber.fromSequence(3).equals(CatalogNumber.parse("JQT-003"))).toBe(true);
    expect(CatalogNumber.fromSequence(3).equals(CatalogNumber.fromSequence(4))).toBe(false);
  });
});
