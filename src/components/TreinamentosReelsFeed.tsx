'use client';

import { useState, useEffect, useRef } from 'react';
import { extractYouTubeId } from './VideoPlayer';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Sparkles,
  ArrowDownCircle,
} from 'lucide-react';
import type { ShortReelItem } from '@/lib/reels';

interface TreinamentosReelsFeedProps {
  reels: ShortReelItem[];
  catalogSectionId?: string;
}

export default function TreinamentosReelsFeed({
  reels,
  catalogSectionId = 'catalog-videoaulas',
}: TreinamentosReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sorteia aleatoriamente um reel cadastrado no carregamento inicial
  useEffect(() => {
    setIsMounted(true);
    if (reels && reels.length > 0) {
      const randomIndex = Math.floor(Math.random() * reels.length);
      setCurrentIndex(randomIndex);
    }
  }, [reels]);

  // Navegação rápida por teclado (Setas Cima / Baixo e M para som)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reels.length]);

  if (!reels || reels.length === 0) {
    return null;
  }

  const currentReel = reels[currentIndex] || reels[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const handleRandom = () => {
    if (reels.length <= 1) return;
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * reels.length);
    } while (nextIdx === currentIndex);
    setCurrentIndex(nextIdx);
  };

  const scrollToCatalog = () => {
    const target = document.getElementById(catalogSectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ytId = extractYouTubeId(currentReel.videoUrl);
  const isYouTube = !!ytId;
  const embedSrc = isYouTube
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&playsinline=1&modestbranding=1&rel=0&controls=1`
    : currentReel.videoUrl;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl border border-slate-200 card-shadow p-5 sm:p-7 space-y-5"
    >
      {/* Cabeçalho Integrado no Design System da CotaFácil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Pílulas Rápidas & Dicas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Dicas Rápidas de Treinamento
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vídeos curtos e objetivos em formato vertical para consulta ágil no dia a dia.
          </p>
        </div>

        {/* Contador e Botão de Descer */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <span className="bg-slate-100 text-slate-700 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-slate-200">
            {currentIndex + 1} de {reels.length}
          </span>
          <button
            onClick={scrollToCatalog}
            className="text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-200 transition flex items-center space-x-1.5"
          >
            <span>Ver Videoaulas &darr;</span>
          </button>
        </div>
      </div>

      {/* Palco do Player Vertical: Fundo neutro suave com smartphone em destaque */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center relative border border-slate-200/80 min-h-[580px] sm:min-h-[640px]">
        
        {/* Frame Estilo Smartphone (Proporção 9:16) */}
        <div className="relative w-full max-w-[330px] sm:max-w-[340px] h-[540px] sm:h-[580px] bg-slate-950 rounded-[32px] sm:rounded-[36px] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between">
          
          {/* Alto-falante / Detalhe sutil do topo do celular */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-slate-700/60 z-30 pointer-events-none"></div>

          {/* Vídeo / Iframe */}
          <div className="absolute inset-0 w-full h-full bg-black">
            {isMounted && (
              <>
                {isYouTube ? (
                  <iframe
                    key={`${currentReel.id}-${currentIndex}-${isMuted}`}
                    src={embedSrc}
                    title={currentReel.title}
                    className="w-full h-full border-0 object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={`${currentReel.id}-${currentIndex}`}
                    src={embedSrc}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </>
            )}
          </div>

          {/* Topo do Reel: Selo e Botão de Áudio */}
          <div className="relative z-20 p-4 pt-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
            <span className="text-[10px] sm:text-[11px] font-bold text-white bg-black/60 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              ⚡ Dica Rápida
            </span>

            {/* Controle de Áudio */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 backdrop-blur shadow-md ${
                isMuted
                  ? 'bg-black/70 hover:bg-black/90 text-slate-200 border border-white/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400'
              }`}
              title="Ativar/Desativar áudio (Tecla M)"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Toque p/ som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px]">Som Ativo</span>
                </>
              )}
            </button>
          </div>

          {/* Rodapé do Reel: Título e Descrição */}
          <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto">
            {currentReel.categoryTag && (
              <span className="text-[10px] sm:text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
                {currentReel.categoryTag}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-md">
              {currentReel.title}
            </h3>
            {currentReel.description && (
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {currentReel.description}
              </p>
            )}

            {/* Barra de Progresso do Carrossel */}
            <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Controles Laterais Desktop (Ao lado do telefone, estilo limpo) */}
          <div className="absolute right-[-68px] top-1/2 -translate-y-1/2 hidden md:flex flex-col space-y-3 z-30">
            <button
              onClick={handlePrev}
              title="Dica Anterior (Seta Cima ↑)"
              className="w-12 h-12 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center justify-center border border-slate-200 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              title="Próxima Dica (Seta Baixo ↓)"
              className="w-12 h-12 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center justify-center border border-slate-200 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleRandom}
              title="Sortear Outra Dica Aleatória"
              className="w-12 h-12 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 flex items-center justify-center border border-slate-200 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Controles Mobile (Flutuantes na base em celulares) */}
        <div className="md:hidden mt-4 flex items-center space-x-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-md">
          <button
            onClick={handlePrev}
            className="p-1.5 text-slate-600 hover:text-blue-700 active:scale-90"
            title="Anterior"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2 font-mono">
            {currentIndex + 1} / {reels.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 text-slate-600 hover:text-blue-700 active:scale-90"
            title="Próximo"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <button
            onClick={handleRandom}
            className="p-1.5 text-purple-600 hover:text-purple-700 active:scale-90"
            title="Sortear"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Botão de convite para rolar a tela */}
        <button
          onClick={scrollToCatalog}
          className="mt-6 flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition group"
        >
          <span>Acessar as videoaulas e tutoriais completos abaixo</span>
          <ArrowDownCircle className="w-4 h-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
