import type { Metadata } from "next";
import { Backdrop } from "@/presentation/components/backdrop";
import { AFTER_THREAD } from "@/presentation/components/post";
import { SiteFrame } from "@/presentation/components/site-frame";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "entrar",
  // Porta dos fundos: não aparece em buscador nem em link do site.
  robots: { index: false, follow: false },
};

/** Acesso de administrador (ferramentas de arte). Não há link para cá no site. */
export default function LoginPage() {
  return (
    <>
      <Backdrop strength={0.35} />
      <SiteFrame>
        <main className={`${AFTER_THREAD} flex-1 pt-[24svh]`}>
          <h1 className="mb-10 text-3xl font-light italic">entrar.</h1>
          <LoginForm />
        </main>
      </SiteFrame>
    </>
  );
}
