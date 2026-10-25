/**
 * Copia texto para a área de transferência. Precisa ser chamado direto no
 * toque (o navegador só libera a cópia logo após um gesto). Tenta a API
 * moderna e cai para o método antigo; devolve se de fato copiou.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = Object.assign(document.createElement("textarea"), { value: text });
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
