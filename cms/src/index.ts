import type { Core } from '@strapi/strapi';

const POST = 'api::post.post';

/**
 * Como cada campo do Registro aparece no painel: nome em português, uma ajuda
 * curta e um exemplo. Os nomes técnicos (usados pela API e pelo site) não mudam.
 */
const FIELDS: Record<string, { label: string; description?: string; placeholder?: string }> = {
  writtenAt: {
    label: 'Momento',
    description: 'Data e hora do registro (horário de São Paulo). Define a posição no fluxo.',
  },
  kind: {
    label: 'Forma',
    description: 'text, code, chord ou photo — muda só a apresentação, nunca vira rótulo no site.',
  },
  title: {
    label: 'Título',
    description: 'Opcional. Com título, o fluxo mostra só o primeiro parágrafo e "continuar →".',
    placeholder: 'Sem título, o próprio texto é o registro',
  },
  slug: {
    label: 'Endereço',
    description: 'Final do link: /registros/<endereço>. Use o botão para gerar a partir do título.',
  },
  body: {
    label: 'Texto',
    description: 'Markdown. Na forma photo vira a legenda; na forma code, coloque o trecho num bloco ```.',
  },
  image: {
    label: 'Imagem',
    description:
      'Obrigatória na forma photo; nas outras, acompanha o texto. Preencha o "Alternative text" do arquivo. Para recortar à mão, use o lápis → corte na biblioteca de mídia.',
  },
  imageFilter: {
    label: 'Filtro da imagem',
    description: 'submersa = o tratamento do site (P&B, fundida à névoa). As demais mostram a foto com o filtro.',
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
    description: 'Só na forma chord.',
    placeholder: 'Dadd9',
  },
  chordShape: {
    label: 'Desenho do acorde',
    description: 'Opcional. Casas da 6ª à 1ª corda.',
    placeholder: 'x 5 4 2 3 0',
  },
};

/** Ordem do formulário: quando e como, o texto, a imagem e seu tratamento, o acorde. */
const EDIT_LAYOUT = [
  [{ name: 'writtenAt', size: 6 }, { name: 'kind', size: 6 }],
  [{ name: 'title', size: 6 }, { name: 'slug', size: 6 }],
  [{ name: 'body', size: 12 }],
  [{ name: 'image', size: 6 }, { name: 'imageFilter', size: 6 }],
  [{ name: 'imageRatio', size: 6 }, { name: 'imageFocus', size: 6 }],
  [{ name: 'chordName', size: 6 }, { name: 'chordShape', size: 6 }],
];

const LIST_LAYOUT = ['writtenAt', 'title', 'kind', 'image'];

/**
 * Aplica rótulos e layout a cada inicialização: a configuração do painel fica
 * versionada no código. (Ajustes feitos à mão em "Configure the view" são sobrescritos.)
 */
async function configurePostEditor(strapi: Core.Strapi) {
  const contentTypes = strapi.plugin('content-manager').service('content-types');
  const contentType = contentTypes.findContentType(POST);
  if (!contentType) return;

  const current = await contentTypes.findConfiguration(contentType);
  const metadatas = { ...current.metadatas };
  for (const [field, { label, description = '', placeholder = '' }] of Object.entries(FIELDS)) {
    if (!metadatas[field]) continue;
    metadatas[field] = {
      ...metadatas[field],
      edit: { ...metadatas[field].edit, label, description, placeholder },
      list: { ...metadatas[field].list, label },
    };
  }

  await contentTypes.updateConfiguration(contentType, {
    settings: { ...current.settings, mainField: 'title', defaultSortBy: 'writtenAt', defaultSortOrder: 'DESC' },
    metadatas,
    layouts: { ...current.layouts, edit: EDIT_LAYOUT, list: LIST_LAYOUT },
  });
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await configurePostEditor(strapi);
    } catch (error) {
      // O painel funciona com a configuração padrão; isto é só conforto de edição.
      strapi.log.warn(`[noise] não deu para configurar o editor de registros: ${(error as Error).message}`);
    }
  },
};
