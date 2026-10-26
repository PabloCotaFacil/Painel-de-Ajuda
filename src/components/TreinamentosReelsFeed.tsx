'use client';

import { useState, useEffect, useRef } from 'react';
import { extractYouTubeId } from './VideoPlayer';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Tv,
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
  // Sorteia aleatoriamente um índice inicial
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Garante que o sorteio ocorra no cliente após montagem (evita mismatch de hidratação do SSR)
  useEffect(() => {
    setIsMounted(true);
    if (reels && reels.length > 0) {
      const randomIndex = Math.floor(Math.random() * reels.length);
      setCurrentIndex(randomIndex);
    }
  }, [reels]);

  // Navegação por teclado (Setas Cima / Baixo, Barra de espaço para áudio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em campo de texto
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

  // Parser do vídeo (YouTube Shorts / Não Listado / MP4)
  const ytId = extractYouTubeId(currentReel.videoUrl);
  const isYouTube = !!ytId;
  const embedSrc = isYouTube
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&playsinline=1&modestbranding=1&rel=0&controls=1`
    : currentReel.videoUrl;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl transition-all"
    >
      {/* Barra de Topo do Feed com Abas Rápidas */}
      <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pílulas Rápidas &bull; Dicas de 1 Minuto</span>
          </span>
          <span className="hidden sm:inline-block bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
            {currentIndex + 1} de {reels.length}
          </span>
        </div>

        {/* Atalho para ir direto às videoaulas completas do YouTube */}
        <button
          onClick={scrollToCatalog}
          className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-700/80 font-bold transition flex items-center space-x-1.5 active:scale-95"
        >
          <Tv className="w-3.5 h-3.5 text-rose-500" />
          <span>Ver Aulas no YouTube &darr;</span>
        </button>
      </div>

      {/* Área Central: Player Vertical Estilo Reels / Smartphone */}
      <div className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Glow de fundo com blur sutil */}
        <div className="absolute inset-0 bg-blue-600/10 filter blur-3xl pointer-events-none"></div>

        {/* Moldura do Vídeo (Proporção 9:16 Vertical Limpo) */}
        <div className="relative w-full max-w-[340px] h-[540px] sm:h-[590px] bg-black rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between">
          {/* Vídeo / Iframe em 9:16 */}
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
          <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
            <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              ⚡ Dica Rápida
            </span>

            {/* Controle de Áudio (Mudo / Ativar Som) */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 backdrop-blur shadow-md ${
                isMuted
                  ? 'bg-black/70 hover:bg-black/90 text-slate-200 border border-white/25'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400'
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

          {/* Rodapé do Reel: Título e Descrição (Totalmente Limpo, Sem Curtidas ou Comentários) */}
          <div className="relative z-20 p-5 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto">
            {currentReel.categoryTag && (
              <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
                {currentReel.categoryTag}
              </span>
            )}
            <h3 className="text-base font-black text-white leading-snug drop-shadow-md">
              {currentReel.title}
            </h3>
            {currentReel.description && (
              <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                {currentReel.description}
              </p>
            )}

            {/* Barra Visual de Indicador */}
            <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Botões de Navegação Desktop Laterais */}
          <div className="absolute right-[-64px] top-1/2 -translate-y-1/2 hidden md:flex flex-col space-y-3 z-30">
            <button
              onClick={handlePrev}
              title="Dica Anterior (Seta Cima ↑)"
              className="w-11 h-11 rounded-full bg-slate-800/95 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 shadow-xl transition active:scale-95 group"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              title="Próxima Dica (Seta Baixo ↓)"
              className="w-11 h-11 rounded-full bg-slate-800/95 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 shadow-xl transition active:scale-95 group"
            >
              <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleRandom}
              title="Sortear Outra Dica Aleatória"
              className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center border border-purple-400 shadow-xl transition active:scale-95 group"
            >
              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Botões de Navegação Mobile (Flutuantes na base em telas pequenas) */}
        <div className="md:hidden absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 shadow-xl">
          <button
            onClick={handlePrev}
            className="p-1.5 text-slate-300 hover:text-white active:scale-90"
            title="Anterior"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-bold text-slate-300 px-1 font-mono">
            {currentIndex + 1}/{reels.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 text-slate-300 hover:text-white active:scale-90"
            title="Próximo"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <button
            onClick={handleRandom}
            className="p-1.5 text-purple-400 hover:text-purple-300 active:scale-90"
            title="Sortear"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Convite e Seta para Descer às Videoaulas Completas do YouTube */}
        <button
          onClick={scrollToCatalog}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-slate-400 hover:text-white transition group py-1"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider bg-slate-900/95 px-3.5 py-1 rounded-full border border-slate-700 text-slate-300 group-hover:border-cyan-400 transition shadow-lg flex items-center gap-1.5">
            <span>Role para ver as videoaulas completas no YouTube</span>
            <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
}
