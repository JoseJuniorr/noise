const DAY_MS = 24 * 60 * 60 * 1000;

// Registros guardam hora local sem fuso; lidos como UTC, horário de verão não rouba um dia.
const toTime = (iso: string) => Date.parse(/[zZ]$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`);

/** Dias inteiros entre dois instantes ISO, independente da ordem. */
export function daysBetween(a: string, b: string): number {
  return Math.floor(Math.abs(toTime(a) - toTime(b)) / DAY_MS);
}

/**
 * Espaço vertical (rem) entre dois registros, proporcional ao tempo que passou.
 * Logarítmico para que um ano de silêncio pese mais que uma semana, sem virar
 * uma página vazia: de 3rem (mesmo dia) até 14rem.
 */
export function passageGap(days: number): number {
  const gap = 3 + Math.log2(Math.max(days, 0) + 1) * 2;
  return Math.min(Math.round(gap * 4) / 4, 14);
}
