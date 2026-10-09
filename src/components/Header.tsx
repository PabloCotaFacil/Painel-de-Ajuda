'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Home, BookOpen, Layers } from 'lucide-react';

export default function Header({ initialSearch = '' }: { initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-sm sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="bg-slate-50 border-b border-slate-100 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              COTAFÁCIL
            </span>
            <span className="hidden sm:inline font-medium text-slate-600">
              Hub de Apoio Operacional — Imobiliário, Crédito PJ & Agro
            </span>
          </div>
          <div className="text-slate-400 font-medium">
            Portal Oficial de Manuais & Regras
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo (Limpo, sem bordas brilhantes) */}
        <Link href="/" className="flex items-center space-x-3.5 group shrink-0">
          <div className="flex items-center">
            <Image
              src="/cotafacil-logo.png"
              alt="CotaFácil Soluções Financeiras"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </div>
          <div className="hidden sm:block border-l border-slate-200 pl-3.5">
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
              Hub de Apoio <span className="text-blue-600">Operacional</span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
              Imobiliário • PJ & Giro • Agro
            </span>
          </div>
        </Link>

        {/* Search Bar no Topo */}
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Busque por regras, taxas, LTV, CPR, manuais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-full bg-slate-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shrink-0"
            title="Pesquisar"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Sub Navigation Bar com Links Rápidos */}
      <div className="bg-slate-50/80 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto py-2.5 text-xs font-bold text-slate-600 scrollbar-none">
          <Link href="/" className="hover:text-blue-600 transition flex items-center space-x-1.5 whitespace-nowrap shrink-0">
            <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Início</span>
          </Link>
          <Link href="/categorias/all" className="hover:text-blue-600 transition flex items-center space-x-1 whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Todas as Categorias</span>
          </Link>
          <Link href="/categorias/imobiliario" className="hover:text-blue-600 transition whitespace-nowrap shrink-0">
            🏡 Crédito Imobiliário
          </Link>
          <Link href="/categorias/credito-pj" className="hover:text-blue-600 transition whitespace-nowrap shrink-0">
            🏢 Crédito PJ & Giro
          </Link>
          <Link href="/categorias/credito-agro" className="hover:text-blue-600 transition whitespace-nowrap shrink-0">
            🌾 Crédito Agro
          </Link>
          <Link href="/categorias/treinamentos" className="hover:text-blue-600 transition flex items-center space-x-1.5 whitespace-nowrap shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Regras & Treinamentos</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
