'use client';

import Link from 'next/link';
import { Home, Building2, Sprout, BookOpen, Layers } from 'lucide-react';

interface CategoryCardsProps {
  activeSlug?: string;
  floating?: boolean;
}

export default function CategoryCards({ activeSlug, floating = false }: CategoryCardsProps) {
  const categories = [
    {
      name: 'TODAS AS CATEGORIAS',
      slug: 'all',
      description: 'Acesse todas as esteiras, produtos e manuais disponíveis.',
      icon: Layers,
      isDark: true,
    },
    {
      name: 'CRÉDITO IMOBILIÁRIO',
      slug: 'imobiliario',
      description: 'Financiamento habitacional, Home Equity e repasse Caixa/Itaú/BB.',
      icon: Home,
      isDark: false,
    },
    {
      name: 'CRÉDITO PJ & GIRO',
      slug: 'credito-pj',
      description: 'Capital de Giro, Pronampe, FGO e Antecipação de Recebíveis.',
      icon: Building2,
      isDark: false,
    },
    {
      name: 'CRÉDITO AGRO',
      slug: 'credito-agro',
      description: 'Custeio agrícola/pecuário, CPR, Investimento, Moderfrota e Pronaf.',
      icon: Sprout,
      isDark: false,
    },
    {
      name: 'REGRAS & TREINAMENTOS',
      slug: 'treinamentos',
      description: 'Vídeos de treinamento, esteiras operacionais e manuais.',
      icon: BookOpen,
      isDark: false,
    },
  ];

  return (
    <section className={floating ? '-mt-4 sm:-mt-6 relative z-20 mb-8' : 'py-4'}>
      {/* Grid of Bevi-Ajuda Style Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeSlug === cat.slug || (!activeSlug && cat.slug === 'all');
          const targetUrl = cat.slug === 'all' ? '/' : `/categorias/${cat.slug}`;

          return (
            <Link
              key={cat.slug}
              href={targetUrl}
              className={`p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[200px] hover:-translate-y-1.5 ${
                cat.isDark
                  ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:bg-slate-950 border border-slate-800'
                  : 'bg-white text-slate-800 border border-slate-100 card-float hover:border-blue-300 hover:shadow-xl'
              } ${
                isSelected
                  ? 'ring-4 ring-cyan-400/60 scale-[1.02]'
                  : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      cat.isDark ? 'bg-white/10 text-cyan-300' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 uppercase tracking-wide shrink-0">
                      Ativo
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className={`font-black text-xs sm:text-sm tracking-tight leading-snug uppercase ${
                      cat.isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                      cat.isDark ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>
              </div>

              <div
                className={`pt-3.5 flex items-center text-xs font-bold gap-1 transition ${
                  cat.isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                <span>Saiba mais</span>
                <span className="text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
