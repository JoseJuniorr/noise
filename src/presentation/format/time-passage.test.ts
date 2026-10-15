import { describe, expect, it } from "vitest";
import { daysBetween, passageGap } from "./time-passage";

describe("daysBetween", () => {
  it("conta dias inteiros em qualquer ordem", () => {
    expect(daysBetween("2026-10-12T23:41", "2026-10-04T19:20")).toBe(8);
    expect(daysBetween("2026-10-04T19:20", "2026-10-12T23:41")).toBe(8);
  });

  it("é zero no mesmo dia", () => {
    expect(daysBetween("2026-10-12T08:00", "2026-10-12T23:00")).toBe(0);
  });
});

describe("passageGap", () => {
  it("começa em 3rem para registros do mesmo dia", () => {
    expect(passageGap(0)).toBe(3);
  });

  it("cresce com o tempo, mas cada vez mais devagar", () => {
    const week = passageGap(7) - passageGap(0);
    const nextWeek = passageGap(14) - passageGap(7);
    expect(week).toBeGreaterThan(nextWeek);
  });

  it("não passa de 14rem, por mais longo que seja o silêncio", () => {
    expect(passageGap(10_000)).toBe(14);
  });
});
