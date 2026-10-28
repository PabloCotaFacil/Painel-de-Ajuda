'use client';

import { Video } from 'lucide-react';

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

export function getEmbedInfo(rawUrl: string): { type: 'iframe' | 'video'; src: string } {
  const trimmed = (rawUrl || '').trim();
  // 1. YouTube (qualquer formato: watch, youtu.be, shorts, live, embed, com parâmetros extras)
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
    };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?title=0&byline=0&portrait=0`,
    };
  }

  // 3. Loom
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'iframe',
      src: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // 4. Google Drive
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
    };
  }

  // 5. Iframe já formatado
  if (trimmed.includes('/embed/')) {
    return { type: 'iframe', src: trimmed };
  }

  // 6. Direct MP4 / WebM / OGG video file or local upload
  return { type: 'video', src: trimmed };
}

export default function VideoPlayer({
  url,
  title = 'Vídeo de Treinamento',
  videoType,
}: VideoPlayerProps) {
  if (!url) return null;

  const trimmedUrl = url.trim();
  const isShorts =
    videoType === 'reel'
      ? true
      : videoType === 'training'
      ? false
      : trimmedUrl.includes('/shorts/');

  const embed = getEmbedInfo(trimmedUrl);

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl my-6">
      <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <Video className="w-4 h-4" />
          <span>
            {isShorts
              ? 'Pílula Rápida / Reel Vertical (9:16)'
              : 'Reprodutor de Treinamento Completo (16:9)'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 truncate max-w-xs">{title}</span>
      </div>

      <div
        className={
          isShorts
            ? 'p-4 sm:p-6 bg-slate-950 flex items-center justify-center'
            : 'relative w-full aspect-video bg-black flex items-center justify-center'
        }
      >
        <div
          className={
            isShorts
              ? 'relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl'
              : 'w-full h-full'
          }
        >
          {embed.type === 'iframe' ? (
            <iframe
              src={embed.src}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={embed.src}
              controls
              playsInline
              className="w-full h-full object-contain"
              preload="metadata"
            >
              Seu navegador não suporta a reprodução deste formato de vídeo.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
