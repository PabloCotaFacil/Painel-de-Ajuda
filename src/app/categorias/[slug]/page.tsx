import TrainingVideoCard from '@/components/TrainingVideoCard';
import TreinamentosReelsFeed, { type ReelFeedItem } from '@/components/TreinamentosReelsFeed';
import CategoryMaterialsTabs from '@/components/CategoryMaterialsTabs';
import { getOrSeedCategories } from '@/lib/categories';
import { getFastArticlesList } from '@/lib/cache';
import { getActiveShortReels } from '@/lib/reels';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderOpen,
  Layers,
  Video,
  MonitorPlay,
  Sparkles,
  Home,
  FileText,
  ChevronRight,
  Landmark,
} from 'lucide-react';

// ISR com revalidação a cada 60s
export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { subcat?: string };
}) {
  const isTreinamentos = params.slug === 'treinamentos';
  const [categories, allArticles, shortReels] = await Promise.all([
    getOrSeedCategories(),
    getFastArticlesList(),
    isTreinamentos ? getActiveShortReels() : Promise.resolve([]),
  ]);

  const bankPdfCategories = categories.filter((c: any) => c.icon === 'bank-pdf');
  const mainPdfCategories = categories.filter(
    (c: any) =>
      c.slug !== 'treinamentos' &&
      c.slug !== 'imobiliario' &&
      c.icon !== 'bank-pdf' &&
      (c.slug.includes('pdf') || c.icon === 'file')
  );
  const mainPdfHub =
    mainPdfCategories[0] || categories.find((c: any) => c.slug === 'materiais-pdf');
  const pdfCategories = mainPdfCategories.length > 0 ? mainPdfCategories : bankPdfCategories;

  // Tratamento para "TODAS AS CATEGORIAS" (slug === 'all')
  if (params.slug === 'all') {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-800 shadow-sm transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Voltar para a Página Inicial</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 card-shadow transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>Biblioteca Completa</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Todas as Categorias & Esteiras
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Visão geral de todos os materiais, regras de crédito imobiliário, PDFs e treinamentos.
            </p>
          </div>

          {pdfCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pdfCategories.map((pdfCat: any) => (
                <Link
                  key={pdfCat.id}
                  href={`/categorias/${pdfCat.slug}`}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold transition shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>{pdfCat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <CategoryMaterialsTabs
          articles={allArticles}
          categoryName="Todas as Categorias"
          isTreinamentos={false}
        />
      </div>
    );
  }

  const foundCategory = categories.find((c: any) => c.slug === params.slug);
  if (!foundCategory) {
    notFound();
  }

  const isArticleReel = (art: any): boolean => {
    if (!art.videoUrl) return false;
    if (art.videoType === 'training') return false;
    if (art.videoType === 'reel') return true;
    return art.videoUrl.includes('/shorts/');
  };

  const selectedSubcatSlug = searchParams?.subcat || 'all';

  const sourceArticles = isTreinamentos
    ? selectedSubcatSlug === 'all'
      ? allArticles
      : allArticles.filter((a: any) => a.category?.slug === selectedSubcatSlug)
    : allArticles.filter((a: any) => a.category?.slug === params.slug);

  const category = {
    ...foundCategory,
    articles: sourceArticles,
  };

  const articleReels: ReelFeedItem[] = sourceArticles
    .filter((art) => isArticleReel(art))
    .map((art) => ({
      id: art.id,
      title: art.title,
      description: art.summary,
      videoUrl: art.videoUrl!,
      categoryTag: art.category?.name || 'Dica Rápida',
      order: 0,
      isActive: true,
      isArticle: true,
    }));

  const training16x9Articles = sourceArticles.filter(
    (art) => Boolean(art.videoUrl) && !isArticleReel(art)
  );

  const trainingVideoUrls = new Set(
    training16x9Articles.map((a) => a.videoUrl?.trim()).filter(Boolean)
  );

  const reels: ReelFeedItem[] = (
    isTreinamentos ? [...shortReels, ...articleReels] : articleReels
  )
    .filter((r) => !trainingVideoUrls.has(r.videoUrl?.trim()))
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.videoUrl.trim() === item.videoUrl.trim())
    );

  const manualArticles = sourceArticles.filter((art) => !art.videoUrl);
  const otherCategories = categories.filter(
    (c: any) => c.slug !== 'treinamentos' && c.icon !== 'bank-pdf'
  );
  const isPdfHub =
    category.slug === 'materiais-pdf' || category.icon === 'file';
  const isBankPdfPage = category.icon === 'bank-pdf';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-800 shadow-sm transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Voltar para a Página Inicial</span>
        </Link>

        {isBankPdfPage && mainPdfHub && (
          <Link
            href={`/categorias/${mainPdfHub.slug}`}
            className="inline-flex items-center space-x-2 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            <span>Lista de Bancos ({mainPdfHub.name})</span>
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 card-shadow transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            {isTreinamentos ? (
              <Video className="w-4 h-4 text-rose-500" />
            ) : category.slug === 'imobiliario' || category.icon === 'home' ? (
              <Home className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            ) : isBankPdfPage ? (
              <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : category.slug.includes('pdf') || category.icon === 'file' ? (
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FolderOpen className="w-4 h-4 text-cyan-500" />
            )}
            <span>
              {isTreinamentos
                ? 'Central de Capacitação CotaFácil'
                : isBankPdfPage
                ? 'Materiais em PDF • Banco Parceiro'
                : 'Categoria'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {category.slug === 'imobiliario' &&
            pdfCategories.map((pdfCat: any) => (
              <Link
                key={pdfCat.id}
                href={`/categorias/${pdfCat.slug}`}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>{pdfCat.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ))}

          {training16x9Articles.length > 0 && (
            <a
              href="#catalog-videoaulas"
              className="inline-flex items-center space-x-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition"
            >
              <MonitorPlay className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{training16x9Articles.length} Videoaula(s) 16:9</span>
            </a>
          )}

          {reels.length > 0 && (
            <div className="inline-flex items-center space-x-2 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/50 px-3.5 py-2 rounded-2xl text-xs font-extrabold">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{reels.length} Pílula(s) 9:16</span>
            </div>
          )}
        </div>
      </div>

      {isTreinamentos && otherCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-2">
            Filtrar Treinamentos por Categoria:
          </span>

          <Link
            href="/categorias/treinamentos"
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              selectedSubcatSlug === 'all'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todas as Categorias
          </Link>

          {otherCategories.map((c: any) => (
            <Link
              key={c.id}
              href={`/categorias/treinamentos?subcat=${c.slug}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                selectedSubcatSlug === c.slug
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {reels.length > 0 && (
        <section className="space-y-3">
          <TreinamentosReelsFeed
            reels={reels}
            catalogSectionId="catalog-videoaulas"
            trainingsCount={training16x9Articles.length}
            latestTrainingTitle={training16x9Articles[0]?.title || null}
            latestTrainingId={training16x9Articles[0]?.id || null}
          />
        </section>
      )}

      {training16x9Articles.length > 0 && (
        <section
          id="catalog-videoaulas"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 card-shadow space-y-6 scroll-mt-24 transition-colors"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isTreinamentos
                      ? 'Treinamentos Completos (16:9)'
                      : `Videoaulas & Treinamentos de ${category.name}`}
                  </h2>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Formato Horizontal 16:9
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Assista às aulas completas diretamente no reprodutor abaixo ou abra a aula para consultar regras e baixar PDFs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {training16x9Articles.map((art) => (
              <TrainingVideoCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}

      {isBankPdfPage && bankPdfCategories.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-2">
            Bancos Parceiros:
          </span>
          {bankPdfCategories.map((bankCat: any) => (
            <Link
              key={bankCat.id}
              href={`/categorias/${bankCat.slug}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                bankCat.slug === category.slug
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{bankCat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  bankCat.slug === category.slug
                    ? 'bg-white/20 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {bankCat._count?.articles ?? 0}
              </span>
            </Link>
          ))}
        </div>
      )}

      {isPdfHub && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Bancos Parceiros ({bankPdfCategories.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione um banco para acessar os PDFs publicados.
                </p>
              </div>
            </div>
          </div>

          {bankPdfCategories.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
              <Landmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">
                Nenhum banco cadastrado ainda.
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Cadastre os bancos parceiros no Painel Admin em &quot;Categorias &amp; Esteiras&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankPdfCategories.map((bankCat: any) => {
                const count = bankCat._count?.articles ?? 0;
                return (
                  <Link
                    key={bankCat.id}
                    href={`/categorias/${bankCat.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 card-shadow transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-emerald-900/50">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                          {bankCat.name}
                        </h3>
                        {bankCat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {bankCat.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 mt-1.5">
                          <FileText className="w-3 h-3" />
                          <span>
                            {count === 1 ? '1 PDF publicado' : `${count} PDFs publicados`}
                          </span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {(!isPdfHub || manualArticles.length > 0) && (
        <CategoryMaterialsTabs
          articles={manualArticles}
          categoryName={category.name}
          isTreinamentos={isTreinamentos}
          hasVideosAbove={training16x9Articles.length > 0 || reels.length > 0}
        />
      )}
    </div>
  );
}
