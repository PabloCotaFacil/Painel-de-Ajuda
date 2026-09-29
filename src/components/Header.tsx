'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Shield, Percent, Home, BookOpen } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-cotafacil-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <span className="bg-cotafacil-orange text-white font-extrabold px-2.5 py-0.5 rounded text-[11px] tracking-wide">
              HUB DE APOIO
            </span>
            <span className="hidden md:inline text-slate-200 font-medium">
              Imobiliário • Crédito PJ • Crédito Agro
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/comissoes"
              className="flex items-center space-x-1.5 bg-cotafacil-orange hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-full transition shadow-sm text-xs"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Gatilhos de Comissão</span>
            </Link>
            <Link
              href="/admin/materiais"
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-1 rounded-full border border-white/20 transition text-xs"
            >
              <Shield className="w-3.5 h-3.5 text-cotafacil-amber" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header with CotaFácil Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and System Title */}
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <Image
              src="/cotafacil-logo.png"
              alt="CotaFácil Soluções Financeiras"
              width={200}
              height={55}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block border-l border-slate-200 pl-4">
            <span className="text-lg font-black text-cotafacil-teal tracking-tight block">
              Hub de Apoio Operacional
            </span>
            <span className="text-xs text-slate-500 font-semibold">
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
            className="w-full pl-4 pr-12 py-2.5 rounded-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cotafacil-teal focus:bg-white shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 p-2 bg-cotafacil-teal hover:bg-cotafacil-tealDark text-white rounded-full transition"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto py-2.5 text-xs sm:text-sm font-bold text-slate-700 scrollbar-none">
          <Link href="/" className="hover:text-cotafacil-teal transition flex items-center space-x-1.5 whitespace-nowrap">
            <Home className="w-4 h-4 text-cotafacil-teal" />
            <span>Início</span>
          </Link>
          <Link href="/categorias/imobiliario" className="hover:text-cotafacil-teal transition whitespace-nowrap">
            🏡 Crédito Imobiliário
          </Link>
          <Link href="/categorias/credito-pj" className="hover:text-cotafacil-teal transition whitespace-nowrap">
            🏢 Crédito PJ & Giro
          </Link>
          <Link href="/categorias/credito-agro" className="hover:text-cotafacil-teal transition whitespace-nowrap">
            🌾 Crédito Agro
          </Link>
          <Link href="/categorias/treinamentos" className="hover:text-cotafacil-teal transition flex items-center space-x-1 whitespace-nowrap">
            <BookOpen className="w-4 h-4 text-cotafacil-green" />
            <span>Regras & Treinamentos</span>
          </Link>
          <Link href="/comissoes" className="hover:text-orange-600 transition text-cotafacil-orange font-extrabold whitespace-nowrap">
            ⚡ Gatilhos de Comissão
          </Link>
        </div>
      </div>
    </header>
  );
}
