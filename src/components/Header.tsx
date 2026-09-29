'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Shield, Home, BookOpen, Lock } from 'lucide-react';

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
    <header className="gradient-header text-white shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-white/10 flex flex-wrap justify-between items-center gap-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <span className="bg-cyan-500 text-slate-950 font-black px-2.5 py-0.5 rounded text-[11px] tracking-wide whitespace-nowrap uppercase">
            HUB DE APOIO
          </span>
          <span className="hidden md:inline text-slate-200 font-medium">
            Imobiliário • Crédito PJ • Crédito Agro
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/comissoes"
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-full transition shadow-sm text-xs whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Área do Gestor (Comissões)</span>
          </Link>
          <Link
            href="/admin/materiais"
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-full border border-white/20 transition text-xs whitespace-nowrap"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Painel Admin</span>
          </Link>
        </div>
      </div>

      {/* Main Header Content with Transparent CotaFácil Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-4 group shrink-0">
          <div className="p-1.5 flex items-center">
            <Image
              src="/cotafacil-logo.png"
              alt="CotaFácil Soluções Financeiras"
              width={180}
              height={55}
              priority
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
          <div className="hidden sm:block border-l border-white/20 pl-4">
            <span className="text-xl font-extrabold tracking-tight text-white block">
              Hub de apoio <span className="text-cyan-400">Operacional</span>
            </span>
            <span className="text-xs text-cyan-200 font-medium tracking-wide">
              Imobiliário | Crédito PJ | Crédito Agro
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Busque por regras, taxas, LTV, CPR, manuais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-full bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition shrink-0"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-slate-900/40 backdrop-blur border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto py-3 text-xs sm:text-sm font-medium text-slate-200 scrollbar-none">
          <Link href="/" className="hover:text-cyan-300 transition flex items-center space-x-1.5 whitespace-nowrap shrink-0">
            <Home className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Início</span>
          </Link>
          <Link href="/categorias/imobiliario" className="hover:text-cyan-300 transition whitespace-nowrap shrink-0">
            🏡 Crédito Imobiliário
          </Link>
          <Link href="/categorias/credito-pj" className="hover:text-cyan-300 transition whitespace-nowrap shrink-0">
            🏢 Crédito PJ & Giro
          </Link>
          <Link href="/categorias/credito-agro" className="hover:text-cyan-300 transition whitespace-nowrap shrink-0">
            🌾 Crédito Agro
          </Link>
          <Link href="/categorias/treinamentos" className="hover:text-cyan-300 transition flex items-center space-x-1.5 whitespace-nowrap shrink-0">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Regras & Treinamentos</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
