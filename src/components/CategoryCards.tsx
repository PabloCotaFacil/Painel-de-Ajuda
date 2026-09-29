'use client';

import Link from 'next/link';
import { Home, Building2, Sprout, BookOpen, Layers } from 'lucide-react';

interface CategoryCardsProps {
  activeSlug?: string;
}

export default function CategoryCards({ activeSlug }: CategoryCardsProps) {
  const categories = [
    {
      name: 'TODAS AS CATEGORIAS',
      slug: 'all',
      description: 'Acesse todas as categorias e manuais disponíveis.',
      icon: Layers,
      color: 'bg-slate-900 text-white',
      accent: 'border-cyan-500',
    },
    {
      name: 'CRÉDITO IMOBILIÁRIO',
      slug: 'imobiliario',
      description: 'Financiamento habitacional, LTV Caixa/Itaú/BB e Home Equity.',
      icon: Home,
      color: 'bg-white text-slate-800',
      accent: 'border-blue-600',
    },
    {
      name: 'CRÉDITO PJ & GIRO',
      slug: 'credito-pj',
      description: 'Capital de Giro, FGO, Pronampe e Antecipação.',
      icon: Building2,
      color: 'bg-white text-slate-800',
      accent: 'border-emerald-600',
    },
    {
      name: 'CRÉDITO AGRO',
      slug: 'credito-agro',
      description: 'Custeio, Investimento, CPR, Moderfrota e Pronaf.',
      icon: Sprout,
      color: 'bg-white text-slate-800',
      accent: 'border-green-600',
    },
    {
      name: 'REGRAS & TREINAMENTOS',
      slug: 'treinamentos',
      description: 'Vídeos de treinamento, resumos de esteira e manuais.',
      icon: BookOpen,
      color: 'bg-white text-slate-800',
      accent: 'border-purple-600',
    },
  ];

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
          Categorias em Destaque
        </h2>
        <span className="text-xs font-medium text-slate-500">Selecione para filtrar os materiais</span>
      </div>

      {/* Grid of Public Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeSlug === cat.slug || (!activeSlug && cat.slug === 'all');
          const targetUrl = cat.slug === 'all' ? '/' : `/categorias/${cat.slug}`;

          return (
            <Link
              key={cat.slug}
              href={targetUrl}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between min-h-[185px] card-shadow hover:-translate-y-1 ${
                cat.color
              } ${isSelected ? 'ring-4 ring-cyan-400/50 border-cyan-500 scale-[1.02]' : 'border-slate-200/80 hover:border-blue-400'}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl shrink-0 ${cat.slug === 'all' ? 'bg-white/20' : 'bg-slate-100 text-blue-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 uppercase shrink-0">
                      Ativo
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-tight leading-snug">{cat.name}</h3>
                  <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                </div>
              </div>

              <div className="pt-3 flex items-center text-xs font-bold gap-1 opacity-90 border-t border-current/10">
                <span>Acessar</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
