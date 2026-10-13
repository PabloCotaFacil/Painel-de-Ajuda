import { prisma } from './prisma';

export interface DefaultCategoryDef {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryDef[] = [
  {
    name: 'Crédito Imobiliário',
    slug: 'imobiliario',
    description: 'Financiamento habitacional, Home Equity, repasse bancário e regras de LTV.',
    icon: 'home',
  },
  {
    name: 'Crédito PJ & Giro',
    slug: 'credito-pj',
    description: 'Capital de Giro, FGO, Pronampe, Antecipação de Recebíveis e Linhas de Garantia.',
    icon: 'building',
  },
  {
    name: 'Crédito Agro',
    slug: 'credito-agro',
    description: 'Custeio agrícola/pecuário, CPR, Investimento, Moderfrota e Pronaf.',
    icon: 'sprout',
  },
  {
    name: 'Treinamentos e Videoaulas',
    slug: 'treinamentos',
    description: 'Vídeos de treinamento, videoaulas, tutoriais e esteiras operacionais.',
    icon: 'video',
  },
];

let cachedCategories: any[] | null = null;
let lastCacheTime = 0;

/**
 * Garante que o banco de dados sempre tenha as categorias básicas cadastradas,
 * evitando erros 404 em categorias e formulários com categorias vazias.
 * Usa cache de 60 segundos em memória para respostas instantâneas (0ms).
 */
export async function getOrSeedCategories() {
  const now = Date.now();
  if (cachedCategories && cachedCategories.length > 0 && now - lastCacheTime < 60000) {
    return cachedCategories;
  }

  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, description: cat.description, icon: cat.icon },
          create: cat,
        });
      }

      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    } else {
      // Atualiza o nome da categoria de treinamentos caso ainda esteja com o nome antigo
      const oldTreinamento = categories.find((c) => c.slug === 'treinamentos' && c.name !== 'Treinamentos e Videoaulas');
      if (oldTreinamento) {
        await prisma.category.update({
          where: { slug: 'treinamentos' },
          data: {
            name: 'Treinamentos e Videoaulas',
            description: 'Vídeos de treinamento, videoaulas, tutoriais e esteiras operacionais.',
            icon: 'video',
          },
        });
        categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        });
      }
    }

    cachedCategories = categories;
    lastCacheTime = now;
    return categories;
  } catch (error) {
    console.error('Erro ao buscar/garantir categorias:', error);
    // Retorna categorias com IDs mock para não quebrar a interface em caso de falha de conexão inicial
    return DEFAULT_CATEGORIES.map((c, i) => ({
      id: `default-${i + 1}`,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
    }));
  }
}
