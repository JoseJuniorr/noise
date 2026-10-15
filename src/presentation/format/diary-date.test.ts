import { describe, expect, it } from "vitest";
import { formatDiaryDate } from "./diary-date";

describe("formatDiaryDate", () => {
  it("formata como data de margem de caderno", () => {
    expect(formatDiaryDate("2026-10-12")).toBe("12 out. 2026");
  });

  it("não muda o dia por fuso horário", () => {
    expect(formatDiaryDate("2026-01-01")).toBe("01 jan. 2026");
  });
});
