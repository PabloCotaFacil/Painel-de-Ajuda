'use client';

import Link from 'next/link';
import { Home, Building2, Sprout, BookOpen, Layers, Award } from 'lucide-react';

interface CategoryCardsProps {
  activeSlug?: string;
}

export default function CategoryCards({ activeSlug }: CategoryCardsProps) {
  const categories = [
    {
      name: 'TODAS AS CATEGORIAS',
      slug: 'all',
      description: 'Acesse todas as categorias e manuais operacionais.',
      icon: Layers,
      color: 'bg-cotafacil-teal text-white',
      accent: 'border-cotafacil-orange',
    },
    {
      name: 'CRÉDITO IMOBILIÁRIO',
      slug: 'imobiliario',
      description: 'Financiamento habitacional, LTV Caixa/Itaú/BB e Home Equity.',
      icon: Home,
      color: 'bg-white text-slate-800',
      accent: 'border-cotafacil-teal',
    },
    {
      name: 'CRÉDITO PJ & GIRO',
      slug: 'credito-pj',
      description: 'Capital de Giro, FGO, Pronampe e Antecipação.',
      icon: Building2,
      color: 'bg-white text-slate-800',
      accent: 'border-cotafacil-amber',
    },
    {
      name: 'CRÉDITO AGRO',
      slug: 'credito-agro',
      description: 'Custeio, Investimento, CPR, Moderfrota e Pronaf.',
      icon: Sprout,
      color: 'bg-white text-slate-800',
      accent: 'border-cotafacil-green',
    },
    {
      name: 'REGRAS & TREINAMENTOS',
      slug: 'treinamentos',
      description: 'Vídeos de treinamento, resumos de esteira e manuais.',
      icon: BookOpen,
      color: 'bg-white text-slate-800',
      accent: 'border-slate-400',
    },
    {
      name: 'GATILHOS DE COMISSÃO',
      slug: 'comissoes',
      href: '/comissoes',
      description: 'Tabelas de repasse e aumento de comissão por volume.',
      icon: Award,
      color: 'bg-gradient-to-br from-cotafacil-orange to-amber-600 text-white',
      accent: 'border-cotafacil-amber',
    },
  ];

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-cotafacil-teal flex items-center gap-2">
          <span className="w-2.5 h-6 bg-cotafacil-orange rounded-full inline-block"></span>
          Categorias em Destaque
        </h2>
        <span className="text-xs font-medium text-slate-500">Clique para filtrar os materiais</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeSlug === cat.slug || (!activeSlug && cat.slug === 'all');
          const targetUrl = cat.href || (cat.slug === 'all' ? '/' : `/categorias/${cat.slug}`);

          return (
            <Link
              key={cat.slug}
              href={targetUrl}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between h-44 card-shadow hover:-translate-y-1 ${
                cat.color
              } ${isSelected ? 'ring-4 ring-cotafacil-orange/40 border-cotafacil-orange scale-[1.02]' : 'border-slate-200/80 hover:border-cotafacil-teal'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${cat.slug === 'all' || cat.slug === 'comissoes' ? 'bg-white/20' : 'bg-slate-100 text-cotafacil-teal'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cotafacil-orange text-white uppercase">
                      Ativo
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-sm tracking-tight mb-1">{cat.name}</h3>
                <p className="text-xs opacity-85 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold gap-1 opacity-90">
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
