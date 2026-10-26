import ArticleCard from '@/components/ArticleCard';
import TreinamentosReelsFeed from '@/components/TreinamentosReelsFeed';
import { prisma } from '@/lib/prisma';
import { getOrSeedCategories } from '@/lib/categories';
import { getActiveShortReels } from '@/lib/reels';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Layers, Video } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REMOVED_CATEGORY_SLUGS = ['credito-pj', 'credito-agro'];

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  if (REMOVED_CATEGORY_SLUGS.includes(params.slug)) {
    notFound();
  }

  // Garantir que as categorias padrão existam no banco caso esteja vazio
  await getOrSeedCategories();

  // Tratamento especial para "TODAS AS CATEGORIAS" (slug === 'all')
  if (params.slug === 'all') {
    const allArticles = await prisma.article.findMany({
      where: {
        category: {
          slug: {
            notIn: REMOVED_CATEGORY_SLUGS,
          },
        },
      },
      include: {
        category: true,
        attachments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return (
      <div className="space-y-6">
        {/* Botão de Retornar para a Página Inicial */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 bg-white hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Voltar para a Página Inicial</span>
          </Link>
        </div>

        {/* Header Todas as Categorias */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow">
          <div className="flex items-center space-x-3 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Biblioteca Completa</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Todas as Categorias & Manuais</h1>
          <p className="text-slate-600 text-sm mt-2">
            Visão geral de todos os materiais, regras de crédito imobiliário, esteiras operacionais e treinamentos.
          </p>
        </div>

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

  const category = await prisma.category.findUnique({
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

  const isTreinamentos = params.slug === 'treinamentos';
  const shortReels = isTreinamentos ? await getActiveShortReels() : [];

  // Coleta também os vídeos postados como Artigos na categoria Treinamentos para entrarem no Reel:
  const articleReels = isTreinamentos
    ? category.articles
        .filter((art) => !!art.videoUrl)
        .map((art) => ({
          id: art.id,
          title: art.title,
          description: art.summary,
          videoUrl: art.videoUrl!,
          categoryTag: 'Treinamento Operacional',
          order: 0,
          isActive: true,
        }))
    : [];

  // Junta todos os reels sem duplicatas por videoUrl
  const reels = [...shortReels, ...articleReels].filter(
    (item, index, self) => index === self.findIndex((t) => t.videoUrl === item.videoUrl)
  );

  return (
    <div className="space-y-6">
      {/* Botão de Retornar para a Página Inicial */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 bg-white hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Voltar para a Página Inicial</span>
        </Link>
      </div>

      {/* Category Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow">
        <div className="flex items-center space-x-3 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
          {isTreinamentos ? (
            <Video className="w-4 h-4 text-rose-500" />
          ) : (
            <FolderOpen className="w-4 h-4 text-cyan-500" />
          )}
          <span>{isTreinamentos ? 'Hub de Treinamentos & Pílulas Rápidas' : 'Categoria de Conhecimento'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">{category.name}</h1>
        {category.description && (
          <p className="text-slate-600 text-sm mt-2">{category.description}</p>
        )}
      </div>

      {/* FEED DE REELS (Exibido com destaque no topo para a categoria Treinamentos) */}
      {isTreinamentos && reels.length > 0 && (
        <section className="space-y-3">
          <TreinamentosReelsFeed reels={reels} catalogSectionId="catalog-videoaulas" />
        </section>
      )}

      {/* Articles / Video Lessons List */}
      <section id="catalog-videoaulas" className="space-y-4 pt-4 scroll-mt-20">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              {isTreinamentos && <span className="text-red-600">📺</span>}
              <span>
                {isTreinamentos
                  ? `Videoaulas & Treinamentos Completos no YouTube (${category.articles.length})`
                  : `Materiais em ${category.name} (${category.articles.length})`}
              </span>
            </h2>
            {isTreinamentos && (
              <p className="text-xs text-slate-500 mt-0.5">
                Acesse abaixo os tutoriais completos, esteiras operacionais de bancos e gravações passo a passo.
              </p>
            )}
          </div>
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
