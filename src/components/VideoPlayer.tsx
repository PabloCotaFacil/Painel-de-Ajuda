'use client';

import { Play, Video } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export default function VideoPlayer({ url, title = 'Vídeo de Treinamento' }: VideoPlayerProps) {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // Helper to extract embed url
  const getEmbedUrl = (rawUrl: string): { type: 'iframe' | 'video' | 'link'; src: string } => {
    // YouTube
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[3]}` };
    }

    // Loom
    const loomMatch = rawUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch && loomMatch[1]) {
      return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}` };
    }

    // Google Drive
    const gdriveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdriveMatch && gdriveMatch[1]) {
      return { type: 'iframe', src: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview` };
    }

    // Direct MP4 / WebM / OGG video file or uploaded file
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawUrl) || rawUrl.startsWith('/uploads/')) {
      return { type: 'video', src: rawUrl };
    }

    // Fallback: if it's already an embed URL, treat as iframe, else video or link
    if (rawUrl.includes('/embed/')) {
      return { type: 'iframe', src: rawUrl };
    }

    return { type: 'video', src: rawUrl };
  };

  const embed = getEmbedUrl(trimmedUrl);

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl my-6">
      <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <Video className="w-4 h-4" />
          <span>Vídeo de Treinamento & Instruções</span>
        </div>
        <span className="text-[11px] text-slate-400 truncate max-w-xs">{title}</span>
      </div>

      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
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
            className="w-full h-full object-contain"
            preload="metadata"
          >
            Seu navegador não suporta a reprodução deste formato de vídeo.
          </video>
        )}
      </div>
    </div>
  );
}
