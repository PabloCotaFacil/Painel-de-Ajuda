'use client';

import { useState, useEffect, useRef } from 'react';
import { extractYouTubeId } from './VideoPlayer';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowDownCircle,
  Smartphone,
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
  const [showHint, setShowHint] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Sorteia aleatoriamente um reel cadastrado no carregamento inicial
  useEffect(() => {
    setIsMounted(true);
    if (reels && reels.length > 0) {
      const randomIndex = Math.floor(Math.random() * reels.length);
      setCurrentIndex(randomIndex);
    }

    // Esconde dica após 4 segundos
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [reels]);

  // Navegação por teclado: estritamente Setas Cima / Baixo e M para som
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

  const triggerSlide = (dir: 'up' | 'down') => {
    setSlideDirection(dir);
    setTimeout(() => setSlideDirection(null), 250);
  };

  const handleNext = () => {
    triggerSlide('up');
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    triggerSlide('down');
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  // Suporte a Touch Swipe exclusivo no Celular
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const distance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartY.current = null;
    touchEndY.current = null;
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
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow p-4 sm:p-5 space-y-3.5 transition-colors max-w-xl mx-auto"
    >
      {/* Cabeçalho Compacto e Elegante */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/40">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
              Pílulas Rápidas
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dicas em formato vertical (Reels)
            </p>
          </div>
        </div>

        {/* Contador e Botão de Descer */}
        <div className="flex items-center space-x-2">
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {currentIndex + 1} / {reels.length}
          </span>
          <button
            onClick={scrollToCatalog}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition"
          >
            Aulas &darr;
          </button>
        </div>
      </div>

      {/* Palco Concentrado no Tamanho do Reel (Sem scroll do mouse) */}
      <div className="bg-slate-50/90 dark:bg-slate-950/80 rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center relative border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        
        {/* Frame Estilo Smartphone (Proporção 9:16 Compacta) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full max-w-[310px] sm:max-w-[320px] h-[500px] sm:h-[530px] bg-slate-950 rounded-[28px] sm:rounded-[32px] border-[5px] border-slate-800 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between transition-transform duration-250 ${
            slideDirection === 'up'
              ? '-translate-y-2'
              : slideDirection === 'down'
              ? 'translate-y-2'
              : 'translate-y-0'
          }`}
        >
          {/* Alto-falante sutil */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-slate-700/60 z-30 pointer-events-none"></div>

          {/* Dica visual flutuante temporária */}
          {showHint && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md pointer-events-none flex items-center space-x-1 animate-bounce">
              <span>👆</span>
              <span>Arraste para cima para o próximo</span>
            </div>
          )}

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

          {/* Topo do Reel: Tag e Botão de Áudio */}
          <div className="relative z-20 p-3 pt-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-auto">
            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/20">
              ⚡ Dica Rápida
            </span>

            {/* Controle de Áudio */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1 backdrop-blur shadow-md ${
                isMuted
                  ? 'bg-black/70 hover:bg-black/90 text-slate-200 border border-white/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400'
              }`}
              title="Ativar/Desativar som (Tecla M)"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px]">Som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-white" />
                  <span className="text-[10px]">Ativo</span>
                </>
              )}
            </button>
          </div>

          {/* Rodapé do Reel: Título e Atalho de Próximo Vídeo */}
          <div className="relative z-20 p-3.5 pb-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto">
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                {currentReel.categoryTag && (
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-0.5 truncate">
                    {currentReel.categoryTag}
                  </span>
                )}
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow-md line-clamp-2">
                  {currentReel.title}
                </h3>
                {currentReel.description && (
                  <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">
                    {currentReel.description}
                  </p>
                )}
              </div>

              {/* Botão de toque rápido no celular */}
              <button
                onClick={handleNext}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-md border border-blue-400/50 flex items-center justify-center transition active:scale-90"
                title="Próximo Vídeo"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO CLARA EXCLUSIVA POR BOTÕES (Sem scroll do mouse) */}
        <div className="mt-4 w-full max-w-[310px] flex items-center justify-center gap-2.5">
          <button
            onClick={handlePrev}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1 active:scale-95"
            title="Vídeo Anterior (Seta Cima ↑)"
          >
            <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95 group"
            title="Próximo Vídeo (Seta Baixo ↓)"
          >
            <span>Próximo Vídeo</span>
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Dica de navegação por botões e teclado */}
        <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <Smartphone className="w-3 h-3 text-slate-400" />
          <span>Use os botões acima, setas do teclado (↑ ↓) ou arraste no celular</span>
        </div>

        {/* Botão de convite para ver as videoaulas completas abaixo */}
        <button
          onClick={scrollToCatalog}
          className="mt-3.5 flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition group"
        >
          <span>Acessar videoaulas completas (16:9) abaixo</span>
          <ArrowDownCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
