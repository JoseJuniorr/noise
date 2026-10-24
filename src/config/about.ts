/**
 * Conteúdo da página /sobre. Editar aqui muda a página; nada mais precisa mudar.
 * Um link sem `href` não aparece — serve de lembrete para o que ainda falta.
 */

export type AboutLink = { label: string; href?: string };

export type Project = {
  name: string;
  /** Uma frase: o que é, não como foi feito. */
  summary: string;
  /** Duas ou três linhas de contexto, na sua voz. */
  story: string;
  stack?: string[];
  links: AboutLink[];
};

export const about = {
  /** Quem escreve: abre a página, em parágrafos curtos. */
  intro: [
    "Engenheiro de software e músico.",
    "Escrevo software no ecossistema TypeScript — Angular, NestJS, Node.js, PostgreSQL e Redis — e acredito que ele começa antes do framework: domínio, contratos e arquitetura são o que deixam um sistema continuar evoluindo depois da primeira versão.",
    "A música veio antes. Sempre esteve aqui como sentimento; hoje é prática, ensaio e palco — e é ela que me faz querer ir mais longe.",
    "O noise. é onde essas coisas se encontram com o resto: reflexões, discos, shows, cotidiano, trabalho. Escrevo com o coração, mas com responsabilidade.",
  ],

  projects: [
    {
      name: "Discory",
      summary: "Uma plataforma para descobrir, registrar e conversar sobre música.",
      story:
        "Nasceu da vontade de ter um lugar menos descartável para guardar descobertas musicais — bandas, discos e cenas que ficam fora do centro dos algoritmos. Concebido, arquitetado, desenvolvido e publicado por mim.",
      stack: ["Angular", "NestJS", "PostgreSQL", "Redis"],
      links: [{ label: "discory.com.br", href: "https://discory.com.br" }],
    },
    {
      name: "Archon",
      summary: "Uma engine headless de calendário.",
      story:
        "A lógica das datas — seleção, navegação, validação, plugins — separada por completo da interface. O mesmo núcleo serve Angular, React ou qualquer outra UI, sem duplicar regra de negócio.",
      stack: ["TypeScript", "Angular", "React", "npm"],
      links: [
        { label: "documentação", href: "https://archon-js-docs.netlify.app/" },
        { label: "github", href: "https://github.com/JoseJuniorr/archon" },
        { label: "npm", href: "https://www.npmjs.com/package/@archon-js/core" },
      ],
    },
  ] satisfies Project[],

  /** Onde mais escrevo, além daqui. */
  writing: [
    {
      label: "artigos no LinkedIn",
      href: "https://www.linkedin.com/in/jos%C3%A9-vieira-s-junior/recent-activity/articles/",
    },
    // Falta o endereço da área de tech news.
    { label: "tech news" },
  ] satisfies AboutLink[],

  /** Como trabalho: os princípios, do jeito que estão no meu perfil. */
  principles: [
    ["software", "framework"],
    ["domínio", "biblioteca"],
    ["composição", "acoplamento"],
    ["contratos", "implementações"],
    ["clareza", "esperteza"],
    ["manutenção", "código impressionante"],
  ] as const,

  elsewhere: [
    { label: "github", href: "https://github.com/JoseJuniorr" },
    { label: "linkedin", href: "https://www.linkedin.com/in/jos%C3%A9-vieira-s-junior/" },
    { label: "instagram", href: "https://www.instagram.com/j0sejunior/" },
  ] satisfies AboutLink[],
};
