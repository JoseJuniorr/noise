const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  // Datas de registro são dias de calendário, não instantes: UTC evita "voltar" um dia.
  timeZone: "UTC",
});

/** Data de margem de caderno: "12 out. 2026". */
export function formatDiaryDate(isoDate: string): string {
  const parts = formatter.formatToParts(new Date(`${isoDate}T00:00:00Z`));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}`;
}
