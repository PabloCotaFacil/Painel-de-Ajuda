'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Shield, Percent, Home, BookOpen, Layers } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-white/10 flex justify-between items-center text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <span className="bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide">PORTAL DE AJUDA</span>
          <span className="hidden md:inline text-slate-300">Imobiliário • Crédito PJ • Crédito Agro</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/comissoes"
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-1 rounded-full transition shadow-sm"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Tabelas de Comissões & Gatilhos</span>
          </Link>
          <Link
            href="/admin/materiais"
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 transition"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área Admin (Subir Materiais)</span>
          </Link>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-white text-slate-900 p-2.5 rounded-2xl shadow-lg group-hover:scale-105 transition transform">
            <Layers className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white block">
              imob<span className="text-cyan-400">ajuda</span>
            </span>
            <span className="text-xs text-cyan-200 font-medium tracking-wider uppercase">
              Giro & Agro Conhecimento
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Busque por regras, taxas, LTV, CPR, bancos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-full bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Navigation Subbar */}
      <div className="bg-slate-900/40 backdrop-blur border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto py-2.5 text-sm font-medium text-slate-200 scrollbar-none">
          <Link href="/" className="hover:text-cyan-300 transition flex items-center space-x-1.5 whitespace-nowrap">
            <Home className="w-4 h-4 text-cyan-400" />
            <span>Início</span>
          </Link>
          <Link href="/categorias/imobiliario" className="hover:text-cyan-300 transition whitespace-nowrap">
            🏡 Crédito Imobiliário
          </Link>
          <Link href="/categorias/credito-pj" className="hover:text-cyan-300 transition whitespace-nowrap">
            🏢 Crédito PJ & Giro
          </Link>
          <Link href="/categorias/credito-agro" className="hover:text-cyan-300 transition whitespace-nowrap">
            🌾 Crédito Agro
          </Link>
          <Link href="/categorias/treinamentos" className="hover:text-cyan-300 transition flex items-center space-x-1 whitespace-nowrap">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Treinamentos & Resumos</span>
          </Link>
          <Link href="/comissoes" className="hover:text-emerald-300 transition text-emerald-400 font-semibold whitespace-nowrap">
            ⚡ Gatilhos de Produção
          </Link>
        </div>
      </div>
    </header>
  );
}
