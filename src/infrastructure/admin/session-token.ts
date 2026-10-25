import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token da sessão de administrador: "<expira-em>.<assinatura>". A assinatura
 * (HMAC-SHA256 com um segredo do servidor) impede forjar ou estender a sessão;
 * nada mais é guardado — nem no cookie, nem no servidor.
 */

const sign = (expiresAt: number, secret: string) =>
  createHmac("sha256", secret).update(`noise-admin.${expiresAt}`).digest("base64url");

export function createSessionToken(secret: string, ttlMs: number, now = Date.now()): string {
  const expiresAt = now + ttlMs;
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function isValidSessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token || !secret) return false;
  const [rawExpiry, signature] = token.split(".");
  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || expiresAt <= now || !signature) return false;
  return safeEqual(signature, sign(expiresAt, secret));
}

/** Compara sem vazar, pelo tempo de resposta, quantos caracteres acertou. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
