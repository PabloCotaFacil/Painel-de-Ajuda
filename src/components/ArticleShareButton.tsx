'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ArticleShareButtonProps {
  title: string;
  summary?: string;
}

export default function ArticleShareButton({ title, summary }: ArticleShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `*${title}*\n${summary ? `${summary}\n\n` : ''}Confira as regras e manuais completos: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        return;
      } catch (err) {
        // Fallback para cópia para a área de transferência
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-sm ${
        copied
          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
      }`}
      title="Compartilhar ou copiar link do material"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Link Copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Compartilhar</span>
        </>
      )}
    </button>
  );
}
