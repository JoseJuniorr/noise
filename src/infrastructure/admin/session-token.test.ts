// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSessionToken, isValidSessionToken, safeEqual } from "./session-token";

const SECRET = "segredo-de-teste";
const DAY = 24 * 60 * 60 * 1000;

describe("token de sessão de administrador", () => {
  it("vale até expirar", () => {
    const token = createSessionToken(SECRET, DAY, 1_000);
    expect(isValidSessionToken(token, SECRET, 1_000 + DAY - 1)).toBe(true);
    expect(isValidSessionToken(token, SECRET, 1_000 + DAY)).toBe(false);
  });

  it("não aceita assinatura de outro segredo nem validade esticada à mão", () => {
    const token = createSessionToken(SECRET, DAY, 1_000);
    expect(isValidSessionToken(token, "outro-segredo", 2_000)).toBe(false);

    const [, signature] = token.split(".");
    expect(isValidSessionToken(`${1_000 + 365 * DAY}.${signature}`, SECRET, 2_000)).toBe(false);
  });

  it("recusa ausência, lixo e segredo vazio", () => {
    expect(isValidSessionToken(undefined, SECRET)).toBe(false);
    expect(isValidSessionToken("lixo", SECRET)).toBe(false);
    expect(isValidSessionToken(createSessionToken("", DAY), "")).toBe(false);
  });
});

describe("safeEqual", () => {
  it("compara conteúdo, inclusive com tamanhos diferentes", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
