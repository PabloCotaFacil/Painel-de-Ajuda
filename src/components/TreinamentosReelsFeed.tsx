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
  const isWheeling = useRef<boolean>(false);

  // Sorteia aleatoriamente um reel cadastrado no carregamento inicial
  useEffect(() => {
    setIsMounted(true);
    if (reels && reels.length > 0) {
      const randomIndex = Math.floor(Math.random() * reels.length);
      setCurrentIndex(randomIndex);
    }

    // Esconde dica após 5 segundos
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
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

  const triggerSlide = (dir: 'up' | 'down') => {
    setSlideDirection(dir);
    setTimeout(() => setSlideDirection(null), 300);
  };

  const handleNext = () => {
    triggerSlide('up');
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    triggerSlide('down');
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const handleRandom = () => {
    if (reels.length <= 1) return;
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * reels.length);
    } while (nextIdx === currentIndex);
    triggerSlide('up');
    setCurrentIndex(nextIdx);
  };

  // Suporte a Touch Swipe no Celular (Arraste vertical tipo TikTok/Reels)
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
      // Deslizou para cima -> Próximo vídeo
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Deslizou para baixo -> Vídeo anterior
      handlePrev();
    }

    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Suporte a Scroll do Mouse / Trackpad sobre o player
  const handleWheel = (e: React.WheelEvent) => {
    if (isWheeling.current) return;
    if (Math.abs(e.deltaY) < 30) return;

    if (e.deltaY > 0) {
      isWheeling.current = true;
      handleNext();
      setTimeout(() => {
        isWheeling.current = false;
      }, 500);
    } else if (e.deltaY < 0) {
      isWheeling.current = true;
      handlePrev();
      setTimeout(() => {
        isWheeling.current = false;
      }, 500);
    }
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
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow p-5 sm:p-7 space-y-5 transition-colors"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Pílulas Rápidas & Dicas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Dicas Rápidas de Treinamento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vídeos curtos e objetivos em formato vertical para consulta ágil no dia a dia.
          </p>
        </div>

        {/* Contador e Botão de Descer */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {currentIndex + 1} de {reels.length}
          </span>
          <button
            onClick={scrollToCatalog}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
          >
            <span>Ver Videoaulas &darr;</span>
          </button>
        </div>
      </div>

      {/* Palco do Player Vertical */}
      <div
        onWheel={handleWheel}
        className="bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-7 flex flex-col items-center justify-center relative border border-slate-200/80 dark:border-slate-800/80 min-h-[580px] sm:min-h-[640px] transition-colors"
      >
        
        {/* Frame Estilo Smartphone (Proporção 9:16) com suporte a Touch Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full max-w-[330px] sm:max-w-[340px] h-[540px] sm:h-[580px] bg-slate-950 rounded-[32px] sm:rounded-[36px] border-[6px] border-slate-800 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between transition-transform duration-300 ${
            slideDirection === 'up'
              ? '-translate-y-2'
              : slideDirection === 'down'
              ? 'translate-y-2'
              : 'translate-y-0'
          }`}
        >
          {/* Alto-falante / Detalhe sutil do topo do celular */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-slate-700/60 z-30 pointer-events-none"></div>

          {/* Dica visual flutuante nos primeiros segundos */}
          {showHint && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-none flex items-center space-x-1.5 animate-bounce">
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

          {/* Topo do Reel: Selo e Botão de Áudio */}
          <div className="relative z-20 p-3 pt-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto">
            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
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
                  <span className="text-[10px]">Toque p/ som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px]">Som Ativo</span>
                </>
              )}
            </button>
          </div>

          {/* Rodapé do Reel: Título, Descrição e Atalho Rápido para o Próximo */}
          <div className="relative z-20 p-4 pb-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto">
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
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 line-clamp-1 leading-normal">
                    {currentReel.description}
                  </p>
                )}
              </div>

              {/* Botão de Próximo direto dentro do vídeo (Toque rápido no celular) */}
              <button
                onClick={handleNext}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-lg border border-blue-400/50 flex items-center justify-center transition active:scale-90"
                title="Próximo Vídeo"
              >
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </button>
            </div>

            {/* Barra de Progresso do Carrossel */}
            <div className="w-full bg-white/20 h-1 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Controles Laterais Desktop (Ao lado do telefone) */}
          <div className="absolute right-[-68px] top-1/2 -translate-y-1/2 hidden md:flex flex-col space-y-3 z-30">
            <button
              onClick={handlePrev}
              title="Dica Anterior (Seta Cima ↑)"
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              title="Próxima Dica (Seta Baixo ↓)"
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleRandom}
              title="Sortear Outra Dica Aleatória"
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition active:scale-95 group"
            >
              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGAÇÃO CLARA, GRANDE E ULTRA-INTUITIVA ABAIXO DO PLAYER (Ideal para Mobile e PC) */}
        <div className="mt-5 w-full max-w-sm flex items-center justify-center gap-2">
          {/* Botão Anterior */}
          <button
            onClick={handlePrev}
            className="flex-1 max-w-[110px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-sm hover:shadow transition flex items-center justify-center space-x-1.5 active:scale-95"
            title="Vídeo Anterior"
          >
            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Anterior</span>
          </button>

          {/* Botão Principal: PRÓXIMO VÍDEO (Destaque total) */}
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 active:scale-95 group"
            title="Avançar para o Próximo Reel"
          >
            <span>Próximo Vídeo</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Botão Sortear */}
          <button
            onClick={handleRandom}
            className="py-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-sm hover:shadow transition flex items-center justify-center space-x-1 active:scale-95"
            title="Sortear outro vídeo aleatório"
          >
            <Shuffle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sortear</span>
          </button>
        </div>

        {/* Instrução visual para celular e PC */}
        <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>No celular: arraste para cima &bull; No computador: use o mouse ou as setas</span>
        </div>

        {/* Botão de convite para rolar a tela */}
        <button
          onClick={scrollToCatalog}
          className="mt-5 flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition group"
        >
          <span>Acessar as videoaulas e tutoriais completos abaixo</span>
          <ArrowDownCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
