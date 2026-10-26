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

  // Lista de materiais a exibir na grade inferior:
  // REGRA: O que aparece como reel/pílula NÃO deve aparecer como treinamento aqui embaixo
  const displayedArticles = isTreinamentos
    ? category.articles.filter((art) => {
        const isInReels = reels.some(
          (r) => r.id === art.id || (art.videoUrl && r.videoUrl === art.videoUrl)
        );
        return !isInReels;
      })
    : category.articles;

  return (
    <div className="space-y-6">
      {/* Botão de Retornar para a Página Inicial */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-800 shadow-sm transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Voltar para a Página Inicial</span>
        </Link>
      </div>

      {/* Category Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 card-shadow transition-colors">
        <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-2">
          {isTreinamentos ? (
            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <FolderOpen className="w-4 h-4 text-cyan-500" />
          )}
          <span>{isTreinamentos ? 'Treinamentos e Tutoriais' : 'Categoria de Conhecimento'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{category.name}</h1>
        {category.description && (
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{category.description}</p>
        )}
      </div>

      {/* FEED DE REELS (Exibido com destaque no topo para a categoria Treinamentos, apenas se houver vídeos cadastrados) */}
      {isTreinamentos && reels.length > 0 && (
        <section className="space-y-3">
          <TreinamentosReelsFeed reels={reels} catalogSectionId="catalog-videoaulas" />
        </section>
      )}

      {/* Articles / Video Lessons List */}
      <section id="catalog-videoaulas" className="space-y-4 pt-4 scroll-mt-20">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isTreinamentos ? 'Videoaulas e Tutoriais' : `Materiais em ${category.name}`}
            </h2>
            {isTreinamentos && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Acesse os tutoriais detalhados e treinamentos operacionais passo a passo.
              </p>
            )}
          </div>
        </div>

        {displayedArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
              {isTreinamentos
                ? 'Todos os treinamentos em vídeo cadastrados estão disponíveis no Feed de Pílulas acima.'
                : 'Nenhum material cadastrado nesta categoria ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
