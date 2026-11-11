import { prisma } from './prisma';
import { getCached, setCached } from './cache';

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
    name: 'Materiais em PDF',
    slug: 'materiais-pdf',
    description: 'Manuais completos, tabelas e documentos em PDF por banco.',
    icon: 'file',
  },
  {
    name: 'Treinamentos e Videoaulas',
    slug: 'treinamentos',
    description: 'Vídeos de treinamento, videoaulas, tutoriais e esteiras operacionais.',
    icon: 'video',
  },
];

const REMOVED_CATEGORY_SLUGS = ['credito-pj', 'credito-agro'];
const CATEGORIES_CACHE_KEY = 'categories:list';

export async function getOrSeedCategories() {
  const cached = getCached<any[]>(CATEGORIES_CACHE_KEY, 300000);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    let categories = await prisma.category.findMany({
      where: {
        slug: {
          notIn: REMOVED_CATEGORY_SLUGS,
        },
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
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
      await prisma.systemConfig.upsert({
        where: { key: 'seeded_pdf_category' },
        update: { value: 'true' },
        create: { key: 'seeded_pdf_category', value: 'true' },
      });

      categories = await prisma.category.findMany({
        where: {
          slug: {
            notIn: REMOVED_CATEGORY_SLUGS,
          },
        },
        include: {
          _count: {
            select: { articles: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } else {
      // Cria a categoria inicial de PDFs apenas uma única vez caso ainda não tenha sido inicializada
      const seededFlag = await prisma.systemConfig.findUnique({
        where: { key: 'seeded_pdf_category' },
      });

      if (!seededFlag) {
        const hasPdfCat = categories.some((c) => c.slug === 'materiais-pdf');
        if (!hasPdfCat) {
          await prisma.category.create({
            data: {
              name: 'Materiais em PDF',
              slug: 'materiais-pdf',
              description: 'Manuais completos, tabelas e documentos em PDF por banco.',
              icon: 'file',
            },
          });
          categories = await prisma.category.findMany({
            where: {
              slug: {
                notIn: REMOVED_CATEGORY_SLUGS,
              },
            },
            include: {
              _count: {
                select: { articles: true },
              },
            },
            orderBy: { name: 'asc' },
          });
        }
        await prisma.systemConfig.upsert({
          where: { key: 'seeded_pdf_category' },
          update: { value: 'true' },
          create: { key: 'seeded_pdf_category', value: 'true' },
        });
      }
    }

    setCached(CATEGORIES_CACHE_KEY, categories);
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return DEFAULT_CATEGORIES.map((c, i) => ({
      id: `default-${i + 1}`,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      _count: { articles: 0 },
    }));
  }
}
