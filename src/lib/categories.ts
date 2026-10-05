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
    name: 'Regras & Treinamentos',
    slug: 'treinamentos',
    description: 'Vídeos de treinamento, esteiras operacionais, resumos de regras e manuais.',
    icon: 'book',
  },
];

/**
 * Garante que o banco de dados sempre tenha as categorias básicas cadastradas,
 * evitando erros 404 em categorias e formulários com categorias vazias.
 */
export async function getOrSeedCategories() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        });
      }

      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    }

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
