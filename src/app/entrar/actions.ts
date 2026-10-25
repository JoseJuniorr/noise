"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdminPassword, endAdminSession, startAdminSession } from "@/infrastructure/admin/admin";
import { createRateLimiter } from "@/infrastructure/rate-limit";

// Senha errada demais seguida trava a origem por um tempo: adivinhar fica caro.
const allow = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

export type LoginState = { error?: string };

export async function login(_state: LoginState, form: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (!allow(ip)) return { error: "muitas tentativas. tente de novo em alguns minutos." };

  if (!checkAdminPassword(String(form.get("password") ?? ""))) {
    return { error: "senha incorreta." };
  }

  await startAdminSession();
  // Só caminhos internos: o destino nunca pode levar para fora do site.
  const next = String(form.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/");
}
