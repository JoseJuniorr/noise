import { DEFAULT_TREATMENT, IMAGE_FILTERS, IMAGE_FOCI, IMAGE_RATIOS, type ImageTreatment } from "./post";

const pick = <T extends readonly string[]>(options: T, value: unknown, fallback: T[number]): T[number] =>
  typeof value === "string" && (options as readonly string[]).includes(value) ? value : fallback;

/**
 * Lê um tratamento vindo de fora (front-matter, CMS). Valor desconhecido vira
 * o padrão em vez de erro: um filtro mal escrito não deve derrubar o registro.
 */
export function parseImageTreatment(input: { filter?: unknown; ratio?: unknown; focus?: unknown }): ImageTreatment {
  return {
    filter: pick(IMAGE_FILTERS, input.filter, DEFAULT_TREATMENT.filter),
    ratio: pick(IMAGE_RATIOS, input.ratio, DEFAULT_TREATMENT.ratio),
    focus: pick(IMAGE_FOCI, input.focus, DEFAULT_TREATMENT.focus),
  };
}
