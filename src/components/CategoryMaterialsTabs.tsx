'use client';

import { useState, useMemo } from 'react';
import { FileText, BookOpen, Layers } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

interface Attachment {
  id: string;
  name: string;
  fileUrl?: string;
  fileType: string;
}

interface MaterialArticle {
  id: string;
  title: string;
  summary: string;
  videoUrl?: string | null;
  updatedAt: Date | string;
  category: {
    name: string;
    slug: string;
  };
  attachments: Attachment[];
}

type MaterialFilter = 'summaries' | 'pdfs' | 'all';

export default function CategoryMaterialsTabs({
  articles,
  categoryName,
  isTreinamentos = false,
  hasVideosAbove = false,
}: {
  articles: MaterialArticle[];
  categoryName: string;
  isTreinamentos?: boolean;
  hasVideosAbove?: boolean;
}) {
  const summaries = useMemo(
    () => articles.filter((a) => !a.attachments || a.attachments.length === 0),
    [articles]
  );

  const withPdfs = useMemo(
    () => articles.filter((a) => a.attachments && a.attachments.length > 0),
    [articles]
  );

  // Quando há tanto resumos gerais quanto materiais com PDF, inicia mostrando Resumos Gerais separados
  // (ou se só houver um dos tipos, inicia exibindo o que existe sem esconder conteúdo!)
  const defaultTab: MaterialFilter =
    summaries.length > 0 && withPdfs.length > 0
      ? 'summaries'
      : 'all';

  const [filter, setFilter] = useState<MaterialFilter>(defaultTab);

  const visibleArticles = useMemo(() => {
    if (filter === 'summaries') return summaries;
    if (filter === 'pdfs') return withPdfs;
    return articles;
  }, [filter, summaries, withPdfs, articles]);

  const showSeparationTabs = !isTreinamentos && summaries.length > 0 && withPdfs.length > 0;

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {isTreinamentos
                ? `Apostilas, Manuais & Roteiros de Treinamento (${articles.length})`
                : showSeparationTabs && filter === 'summaries'
                ? `Resumos Gerais & Regras — ${categoryName} (${summaries.length})`
                : showSeparationTabs && filter === 'pdfs'
                ? `Materiais & Documentos com PDF — ${categoryName} (${withPdfs.length})`
                : `Manuais & Resumos Gerais — ${categoryName} (${articles.length})`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {showSeparationTabs
                ? 'Resumos gerais de regras separados dos materiais que possuem PDFs em anexo.'
                : 'Documentos oficiais, esteiras operacionais e resumos de consulta rápida.'}
            </p>
          </div>
        </div>

        {showSeparationTabs && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setFilter('summaries')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                filter === 'summaries'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resumos Gerais ({summaries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('pdfs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                filter === 'pdfs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Com PDFs Anexos ({withPdfs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos ({articles.length})</span>
            </button>
          </div>
        )}
      </div>

      {visibleArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            {hasVideosAbove
              ? 'Todos os materiais cadastrados para esta categoria estão disponíveis em formato de vídeo acima.'
              : 'Nenhum resumo ou material cadastrado nesta seção ainda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </section>
  );
}
