import CategoryCards from '@/components/CategoryCards';
import ArticleCard from '@/components/ArticleCard';
import { prisma } from '@/lib/prisma';
import { getOrSeedCategories } from '@/lib/categories';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

// Cache inteligente ISR de 30s para respostas ultrarrápidas ao clicar nos botões
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
      title: 'Hub de apoio Imobiliário, Crédito PJ & Agro',
      subtitle: 'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.',
      primaryButtonText: 'Ver Regras & Manuais',
      primaryButtonUrl: '/categorias/treinamentos',
      secondaryButtonText: null,
      secondaryButtonUrl: null,
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
    take: 12,
  });

  return (
    <div className="space-y-10">
      {/* DYNAMIC EDITABLE HERO BANNER (Configurable via Admin) */}
      <div className="gradient-header rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="max-w-xl z-10 space-y-3">
          {heroBanner.badgeText && (
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-3.5 py-1 rounded-full text-xs text-cyan-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{heroBanner.badgeText}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
            {heroBanner.title}
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed">
            {heroBanner.subtitle}
          </p>
        </div>

        <div className="z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          {heroBanner.primaryButtonText && (
            <Link
              href={heroBanner.primaryButtonUrl || '/categorias/treinamentos'}
              className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl transition shadow-lg text-sm whitespace-nowrap"
            >
              <span>{heroBanner.primaryButtonText}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          )}

          {showSecondaryButton && heroBanner.secondaryButtonText && (
            <Link
              href={heroBanner.secondaryButtonUrl || '/'}
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 transition text-sm whitespace-nowrap"
            >
              <span>{heroBanner.secondaryButtonText}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <CategoryCards />

      {/* Latest Updates Section (Últimas Atualizações) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600 shrink-0" />
              {query ? `Resultados para "${query}"` : 'Últimas Atualizações'}
            </h2>
            <p className="text-xs text-slate-500">
              {query ? `Encontrados ${articles.length} materiais` : 'Regras e manuais atualizados recentemente pela equipe'}
            </p>
          </div>
          {query && (
            <Link href="/" className="text-xs font-bold text-blue-600 hover:underline">
              Limpar busca
            </Link>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 card-shadow">
            <p className="text-slate-500 text-sm font-semibold">Nenhum material encontrado com os critérios digitados.</p>
            <Link href="/" className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline">
              Ver todas as atualizações
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
