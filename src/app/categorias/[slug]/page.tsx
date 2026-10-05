import CategoryCards from '@/components/CategoryCards';
import ArticleCard from '@/components/ArticleCard';
import { prisma } from '@/lib/prisma';
import { getOrSeedCategories } from '@/lib/categories';
import { notFound } from 'next/navigation';
import { FolderOpen, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  // Garantir que as categorias padrão existam no banco caso esteja vazio
  await getOrSeedCategories();

  // Tratamento especial para "TODAS AS CATEGORIAS" (slug === 'all')
  if (params.slug === 'all') {
    const allArticles = await prisma.article.findMany({
      include: {
        category: true,
        attachments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return (
      <div className="space-y-8">
        {/* Header Todas as Categorias */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow">
          <div className="flex items-center space-x-3 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Biblioteca Completa</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Todas as Categorias & Manuais</h1>
          <p className="text-slate-600 text-sm mt-2">
            Visão geral de todos os materiais, regras de crédito, esteiras operacionais e treinamentos.
          </p>
        </div>

        {/* Carousel de Categorias */}
        <CategoryCards activeSlug="all" />

        {/* Lista de Artigos */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black text-slate-900">
              Todos os Materiais Publicados ({allArticles.length})
            </h2>
          </div>

          {allArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm font-semibold">Nenhum material cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  let category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      articles: {
        include: {
          category: true,
          attachments: true,
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow">
        <div className="flex items-center space-x-3 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
          <FolderOpen className="w-4 h-4 text-cyan-500" />
          <span>Categoria de Conhecimento</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">{category.name}</h1>
        {category.description && (
          <p className="text-slate-600 text-sm mt-2">{category.description}</p>
        )}
      </div>

      {/* Category Cards Filter Carousel */}
      <CategoryCards activeSlug={params.slug} />

      {/* Articles List */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-black text-slate-900">
            Materiais em {category.name} ({category.articles.length})
          </h2>
        </div>

        {category.articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">Nenhum material cadastrado nesta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
