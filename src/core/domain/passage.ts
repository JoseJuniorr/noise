/**
 * Nome deixado no "passei por aqui". É público, então só aceita o que parece
 * um nome: letras (com acento), espaço, apóstrofo, hífen e ponto, até 32
 * caracteres. Isso deixa de fora links, e-mails, números e emojis — o formato
 * típico de spam — sem precisar de moderação.
 */
const NAME = /^\p{L}[\p{L}\p{M}' .-]{0,31}$/u;

export type PassageName = { ok: true; name: string | undefined } | { ok: false; reason: string };

export function parsePassageName(raw: unknown): PassageName {
  if (raw === undefined || raw === null) return { ok: true, name: undefined };
  if (typeof raw !== "string") return { ok: false, reason: "nome inválido" };

  const name = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name) return { ok: true, name: undefined }; // sem nome é anônimo, e tudo bem
  // Ponto colado entre letras ("loja.com") é endereço, não nome; "J. R." passa.
  if (!NAME.test(name) || /\S\.\S/.test(name)) return { ok: false, reason: "use só letras, até 32 caracteres" };
  return { ok: true, name };
}

/** "Ana", "Ana e Pedro", "Ana, Pedro e Lu". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}
