import "server-only";

import { cookies } from "next/headers";
import { createSessionToken, isValidSessionToken, safeEqual } from "./session-token";

/**
 * Acesso de administrador do site (as ferramentas de arte). Sem ADMIN_PASSWORD
 * e ADMIN_SESSION_SECRET no ambiente, ninguém é administrador.
 */
export const ADMIN_COOKIE = "noise_admin";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

const secret = () => process.env.ADMIN_SESSION_SECRET ?? "";

/** Lê o cookie da requisição: só pode ser chamado dentro de um <Suspense> ou numa rota. */
export async function isAdmin(): Promise<boolean> {
  return isValidSessionToken((await cookies()).get(ADMIN_COOKIE)?.value, secret());
}

export function checkAdminPassword(attempt: string): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return password.length > 0 && secret().length > 0 && safeEqual(attempt, password);
}

/** Abre a sessão: cookie só HTTP, só HTTPS em produção, invisível ao JavaScript da página. */
export async function startAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, createSessionToken(secret(), SESSION_TTL_MS), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
