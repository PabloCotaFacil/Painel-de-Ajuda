'use client';

import { useState } from 'react';
import { Play, Video, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  videoType?: 'reel' | 'training' | string | null;
}

export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|(?:shorts|live)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = rawUrl.match(regExp);
  return match ? match[1] : null;
}

export function extractVimeoInfo(rawUrl: string): { id: string; hash?: string } | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed.includes('vimeo.com')) return null;

  const queryHashMatch = trimmed.match(/[?&]h=([a-zA-Z0-9]+)/);
  const queryHash = queryHashMatch ? queryHashMatch[1] : undefined;

  const pathMatch = trimmed.match(
    /vimeo\.com\/(?:manage\/videos\/|video\/|channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/
  );

  if (pathMatch && pathMatch[1]) {
    return {
      id: pathMatch[1],
      hash: pathMatch[2] || queryHash,
    };
  }

  return null;
}

export function getVideoThumbnail(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  const vimeo = extractVimeoInfo(rawUrl);
  if (vimeo) {
    return `https://vumbnail.com/${vimeo.id}.jpg`;
  }
  return null;
}

export function getEmbedInfo(
  rawUrl: string,
  options?: { autoplay?: boolean; muted?: boolean; loop?: boolean }
): { type: 'iframe' | 'video'; src: string; provider: 'youtube' | 'vimeo' | 'other' } {
  const trimmed = (rawUrl || '').trim();

  // 1. YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      enablejsapi: '1',
    });
    if (options?.autoplay) params.set('autoplay', '1');
    if (options?.muted !== undefined) params.set('mute', options.muted ? '1' : '0');
    if (options?.loop) {
      params.set('loop', '1');
      params.set('playlist', ytId);
    }
    return {
      type: 'iframe',
      provider: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytId}?${params.toString()}`,
    };
  }

  // 2. Vimeo
  const vimeo = extractVimeoInfo(trimmed);
  if (vimeo) {
    const params = new URLSearchParams();
    if (vimeo.hash) params.set('h', vimeo.hash);
    params.set('dnt', '1');
    params.set('title', '0');
    params.set('byline', '0');
    params.set('portrait', '0');
    params.set('badge', '0');
    params.set('autopause', '0');
    params.set('preload', 'auto');
    if (options?.autoplay) params.set('autoplay', '1');
    if (options?.muted !== undefined) params.set('muted', options.muted ? '1' : '0');
    if (options?.loop) params.set('loop', '1');

    return {
      type: 'iframe',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeo.id}?${params.toString()}`,
    };
  }

  return {
    type: 'video',
    provider: 'other',
    src: trimmed,
  };
}

export default function VideoPlayer({ url, title, videoType }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!url) return null;

  const isReel = videoType === 'reel';
  const embed = getEmbedInfo(url, { autoplay: true });
  const poster = getVideoThumbnail(url);

  const handleStartPlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative mx-auto overflow-hidden bg-slate-950 rounded-2xl shadow-xl border border-slate-800 ${
        isReel
          ? 'max-w-xs aspect-[9/16] w-full'
          : 'w-full aspect-video'
      }`}
    >
      {/* Fachada Facade (Carrega apenas o poster leve inicialmente para máxima velocidade) */}
      {!isPlaying && (
        <div
          onClick={handleStartPlay}
          className="absolute inset-0 z-20 cursor-pointer group flex flex-col items-center justify-center bg-slate-900"
        >
          {poster ? (
            <img
              src={poster}
              alt={title || 'Capa do vídeo'}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
          )}

          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

          {/* Botão Play estilizado */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-blue-600 transition-all duration-200 ring-4 ring-white/20">
            <Play className="w-7 h-7 ml-1 fill-white" />
          </div>

          <div className="relative z-10 mt-3 text-center px-4">
            <span className="text-xs font-black text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm inline-block">
              Clique para assistir
            </span>
          </div>
        </div>
      )}

      {/* Reprodutor Iframe / Video após interação */}
      {isPlaying && (
        <>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {embed.type === 'iframe' ? (
            <iframe
              src={embed.src}
              title={title || 'Vídeo de Treinamento'}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={embed.src}
              controls
              autoPlay
              onLoadedData={() => setIsLoading(false)}
              className="w-full h-full object-contain absolute inset-0"
            />
          )}
        </>
      )}
    </div>
  );
}
