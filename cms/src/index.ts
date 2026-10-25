import type { Core } from '@strapi/strapi';

type FieldLabels = Record<string, { label: string; description?: string; placeholder?: string }>;
type EditLayout = { name: string; size: number }[][];

type EditorConfig = {
  uid: string;
  mainField: string;
  sort?: { by: string; order: 'ASC' | 'DESC' };
  fields: FieldLabels;
  edit: EditLayout;
  list: string[];
};

/**
 * Como cada campo aparece no painel: nome em português, uma ajuda curta e um
 * exemplo. Os nomes técnicos (usados pela API e pelo site) não mudam.
 */
const POST: EditorConfig = {
  uid: 'api::post.post',
  mainField: 'title',
  sort: { by: 'writtenAt', order: 'DESC' },
  fields: {
    writtenAt: {
      label: 'Momento',
      description: 'Data e hora do registro (horário de São Paulo). Define a posição no fluxo.',
    },
    kind: {
      label: 'Forma',
      description: 'texto, codigo, acorde ou foto — muda só a apresentação, nunca vira rótulo no site.',
    },
    title: {
      label: 'Título',
      description: 'Opcional. Com título, o fluxo mostra o resumo (ou o primeiro parágrafo) e "continuar →".',
      placeholder: 'Sem título, o próprio texto é o registro',
    },
    slug: {
      label: 'Endereço',
      description: 'Final do link: /registros/<endereço>. Use o botão para gerar a partir do título.',
    },
    body: {
      label: 'Texto',
      description: 'Markdown. Deixe uma linha em branco entre parágrafos. Em foto vira a legenda; em codigo, use um bloco ```.',
    },
    summary: {
      label: 'Resumo',
      description: 'Opcional, até 280 caracteres. Aparece no fluxo, nas artes e nos buscadores no lugar do começo do texto.',
      placeholder: 'Uma ou duas frases sobre o registro',
    },
    tags: {
      label: 'Tags',
      description: 'Assuntos do registro. Aparecem na página e levam à busca. Crie novas em Content Manager → Tag.',
    },
    keywords: {
      label: 'Palavras-chave',
      description: 'Só para a busca do site, não aparecem. Separe por vírgula.',
      placeholder: 'show, setlist, ao vivo',
    },
    image: {
      label: 'Imagem',
      description:
        'Obrigatória na forma foto; nas outras, acompanha o texto. Preencha o "Alternative text" do arquivo. Para recortar à mão, use o lápis → corte na biblioteca de mídia.',
    },
    imageFilter: {
      label: 'Filtro da imagem',
      description: 'submersa = o tratamento do site (P&B, só a luz aparece) — boa para fotos escuras de palco. Fotos claras: natural ou preto_e_branco.',
    },
    imageRatio: {
      label: 'Proporção do corte',
      description: 'original, quadrado (1:1), retrato (4:5), paisagem (3:2) ou panoramico (21:9).',
    },
    imageFocus: {
      label: 'Foco do corte',
      description: 'Onde o corte se ancora: automatico, rosto, centro, topo ou base.',
    },
    chordName: {
      label: 'Acorde',
      description: 'Só na forma acorde.',
      placeholder: 'Dadd9',
    },
    chordShape: {
      label: 'Desenho do acorde',
      description: 'Opcional. Casas da 6ª à 1ª corda.',
      placeholder: 'x 5 4 2 3 0',
    },
  },
  // Ordem do formulário: quando e como, o texto e como encontrá-lo, a imagem, o acorde.
  edit: [
    [{ name: 'writtenAt', size: 6 }, { name: 'kind', size: 6 }],
    [{ name: 'title', size: 6 }, { name: 'slug', size: 6 }],
    [{ name: 'body', size: 12 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'tags', size: 6 }, { name: 'keywords', size: 6 }],
    [{ name: 'image', size: 6 }, { name: 'imageFilter', size: 6 }],
    [{ name: 'imageRatio', size: 6 }, { name: 'imageFocus', size: 6 }],
    [{ name: 'chordName', size: 6 }, { name: 'chordShape', size: 6 }],
  ],
  list: ['writtenAt', 'title', 'kind', 'tags'],
};

const TAG: EditorConfig = {
  uid: 'api::tag.tag',
  mainField: 'name',
  sort: { by: 'name', order: 'ASC' },
  fields: {
    name: { label: 'Nome', description: 'Como aparece no site.', placeholder: 'música ao vivo' },
    slug: { label: 'Endereço', description: 'Usado na busca: /busca?tag=<endereço>.' },
    posts: { label: 'Registros' },
  },
  edit: [[{ name: 'name', size: 6 }, { name: 'slug', size: 6 }], [{ name: 'posts', size: 12 }]],
  list: ['name', 'slug'],
};

/**
 * Aplica rótulos e layout a cada inicialização: a configuração do painel fica
 * versionada no código. (Ajustes feitos à mão em "Configure the view" são sobrescritos.)
 */
async function configureEditor(strapi: Core.Strapi, config: EditorConfig) {
  const contentTypes = strapi.plugin('content-manager').service('content-types');
  const contentType = contentTypes.findContentType(config.uid);
  if (!contentType) return;

  const current = await contentTypes.findConfiguration(contentType);
  const metadatas = { ...current.metadatas };
  for (const [field, { label, description = '', placeholder = '' }] of Object.entries(config.fields)) {
    if (!metadatas[field]) continue;
    metadatas[field] = {
      ...metadatas[field],
      edit: { ...metadatas[field].edit, label, description, placeholder },
      list: { ...metadatas[field].list, label },
    };
  }

  await contentTypes.updateConfiguration(contentType, {
    settings: {
      ...current.settings,
      mainField: config.mainField,
      ...(config.sort && { defaultSortBy: config.sort.by, defaultSortOrder: config.sort.order }),
    },
    metadatas,
    layouts: { ...current.layouts, edit: config.edit, list: config.list },
  });
}

/** Formas antigas (em inglês) → nomes em português. Idempotente: depois da primeira vez, não muda nada. */
async function migrateKinds(strapi: Core.Strapi) {
  const renames: Record<string, string> = { text: 'texto', code: 'codigo', chord: 'acorde', photo: 'foto' };
  for (const [from, to] of Object.entries(renames)) {
    const changed = await strapi.db.connection('posts').where('kind', from).update({ kind: to });
    if (changed) strapi.log.info(`[noise] forma "${from}" → "${to}" em ${changed} linha(s)`);
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await migrateKinds(strapi);
    } catch (error) {
      strapi.log.error(`[noise] migração das formas falhou: ${(error as Error).message}`);
    }
    for (const config of [POST, TAG]) {
      try {
        await configureEditor(strapi, config);
      } catch (error) {
        // O painel funciona com a configuração padrão; isto é só conforto de edição.
        strapi.log.warn(`[noise] não deu para configurar o editor de ${config.uid}: ${(error as Error).message}`);
      }
    }
  },
};
