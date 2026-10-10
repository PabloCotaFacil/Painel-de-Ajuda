import CategoryCards from '@/components/CategoryCards';
import ArticleCard from '@/components/ArticleCard';
import HeroMedia from '@/components/HeroMedia';
import { prisma } from '@/lib/prisma';
import { getOrSeedCategories } from '@/lib/categories';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Search,
  Info,
  Home,
  Building2,
  Sprout,
  BookOpen,
  ChevronRight,
  Layers,
} from 'lucide-react';

// Cache inteligente ISR de 30s para respostas ultrarrápidas
export const revalidate = 30;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  // Garante que as categorias padrão existam
  await getOrSeedCategories();

  // Fetch Editable Hero Banner config
  let heroBanner = await prisma.heroBanner.findUnique({
    where: { id: 'default-hero' },
  });

  if (!heroBanner) {
    heroBanner = {
      id: 'default-hero',
      badgeText: 'Regras & Manuais Safra 2025/2026',
      title: 'Como podemos te ajudar?',
      subtitle: 'Consulte esteiras operacionais, regras de crédito, downloads de PDFs e treinamentos atualizados.',
      primaryButtonText: 'Ver Regras & Manuais',
      primaryButtonUrl: '/categorias/treinamentos',
      secondaryButtonText: null,
      secondaryButtonUrl: null,
      mediaType: 'cards',
      videoUrl: null,
      videoTitle: null,
      cardsJson: '[]',
      updatedAt: new Date(),
    };
  }

  // Filtrar para nunca expor gestor ou admin no banner público
  const isGestorOrAdminButton =
    heroBanner.secondaryButtonUrl?.includes('admin') ||
    heroBanner.secondaryButtonUrl?.includes('comissoes') ||
    heroBanner.secondaryButtonText?.toLowerCase().includes('gestor') ||
    heroBanner.secondaryButtonText?.toLowerCase().includes('admin');

  const showSecondaryButton =
    Boolean(heroBanner.secondaryButtonText?.trim()) &&
    Boolean(heroBanner.secondaryButtonUrl?.trim()) &&
    !isGestorOrAdminButton;

  // Fetch latest articles
  const articles = await prisma.article.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { content: { contains: query } },
          ],
        }
      : undefined,
    include: {
      category: true,
      attachments: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 16,
  });

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* BEVI-AJUDA STYLE HERO BANNER COMPACTO EM ALTURA & PANORÂMICO */}
      {/* ============================================================ */}
      <div className="gradient-hero rounded-3xl px-5 sm:px-8 py-6 sm:py-7 text-white shadow-xl relative overflow-hidden">
        {/* GRAFISMOS VETORIAIS EXCLUSIVOS NO FUNDO (ONDAS E CÍRCULOS) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ondas orgânicas fluidas */}
          <svg
            className="absolute -right-20 -top-24 w-[550px] h-[550px] opacity-15 text-white"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="250" cy="250" r="220" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
            <circle cx="250" cy="250" r="170" stroke="currentColor" strokeWidth="4" />
            <circle cx="250" cy="250" r="110" stroke="currentColor" strokeWidth="2" />
            <path
              d="M 50,250 C 120,120 380,380 450,250"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>

          {/* Grafismo circular e arcos translúcidos à esquerda */}
          <svg
            className="absolute -left-32 -bottom-32 w-[420px] h-[420px] opacity-10 text-cyan-200"
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" />
            <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Gradiente de iluminação suave */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Coluna Esquerda: Textos e Busca Central */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                Olá! Bem-vindo ao Hub de Apoio CotaFácil.
              </span>
              {heroBanner.badgeText && (
                <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-cyan-200 font-bold border border-white/20">
                  <Sparkles className="w-3 h-3 shrink-0 text-cyan-300" />
                  <span>{heroBanner.badgeText}</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white">
                {heroBanner.title || 'Como podemos te ajudar?'}
              </h1>
              {heroBanner.subtitle && (
                <p className="text-blue-100 text-xs sm:text-xs mt-1 max-w-lg leading-relaxed line-clamp-2">
                  {heroBanner.subtitle}
                </p>
              )}
            </div>

            {/* BARRA DE PESQUISA INTEGRADA NO HERO COMPACTA */}
            <form action="/" method="GET" className="pt-1 max-w-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar regras, taxas, LTV, Pronampe, CPR, manuais..."
                  className="w-full pl-4 sm:pl-5 pr-24 sm:pr-28 py-2.5 sm:py-3.5 bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300/60"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-lg transition shadow flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>

              {/* Tags de busca frequente */}
              <div className="flex items-center space-x-1.5 text-[11px] text-cyan-100/90 mt-2 overflow-x-auto scrollbar-none pb-0.5">
                <span className="font-bold shrink-0 text-[10px] uppercase tracking-wider text-cyan-200">Mais buscados:</span>
                <Link href="/?q=Habita%C3%A7%C3%A3o" className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition whitespace-nowrap text-[11px]">
                  Habitação Caixa
                </Link>
                <Link href="/?q=Pronampe" className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition whitespace-nowrap text-[11px]">
                  Pronampe PJ
                </Link>
                <Link href="/?q=CPR" className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition whitespace-nowrap text-[11px]">
                  CPR Agro
                </Link>
                <Link href="/?q=Home%20Equity" className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition whitespace-nowrap text-[11px]">
                  Home Equity
                </Link>
              </div>
            </form>
          </div>

          {/* Coluna Direita: Cards Clicáveis Moldáveis ou Player de Vídeo */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <HeroMedia
              mediaType={heroBanner.mediaType}
              videoUrl={heroBanner.videoUrl}
              videoTitle={heroBanner.videoTitle}
              cardsJson={heroBanner.cardsJson}
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CARDS DE CATEGORIAS FLUTUANTES (IDÊNTICO AO BEVI AJUDA)        */}
      {/* ============================================================ */}
      <CategoryCards floating={true} />

      {/* ============================================================ */}
      {/* SEÇÃO "ÚLTIMAS ATUALIZAÇÕES" ESTILO BEVI AJUDA (2 COLUNAS)     */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-blue-900 flex items-center gap-2 tracking-tight">
              <span className="w-2.5 h-6 bg-cyan-500 rounded-full inline-block"></span>
              {query ? `Resultados para "${query}"` : 'Últimas atualizações'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {query
                ? `Encontrados ${articles.length} materiais correspondentes`
                : 'Consulte os comunicados, regras de esteiras e manuais atualizados recentemente'}
            </p>
          </div>

          <Link
            href="/categorias/all"
            className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition shrink-0"
          >
            <span>Ver biblioteca completa</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* LISTA RÁPIDA EM 2 COLUNAS ESTILO BEVI AJUDA */}
        {articles.length > 0 && !query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pb-6 border-b border-slate-100">
            {articles.slice(0, 8).map((art) => (
              <Link
                key={art.id}
                href={`/artigos/${art.id}`}
                className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:scale-125 transition shrink-0"></span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition truncate">
                    {art.title}
                  </span>
                </div>
                <div className="text-cyan-600 group-hover:text-blue-600 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* GALERIA COMPLETA DE CARDS COM RESUMOS E DOWNLOADS */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Materiais em Destaque</span>
          </h3>

          {articles.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-200">
              <p className="text-slate-500 text-sm font-semibold">
                Nenhum material encontrado com o termo pesquisado.
              </p>
              <Link href="/" className="text-xs font-bold text-blue-700 hover:underline mt-2 inline-block">
                Limpar busca
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
