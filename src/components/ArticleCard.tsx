'use client';

import Link from 'next/link';
import { FileText, Download, Info, Calendar } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  updatedAt: Date | string;
  category: {
    name: string;
    slug: string;
  };
  attachments: Attachment[];
}

export default function ArticleCard({ article }: { article: Article }) {
  const formattedDate = new Date(article.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow hover:border-blue-400 transition flex flex-col justify-between group">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Link
            href={`/categorias/${article.category.slug}`}
            className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition uppercase tracking-wide shrink-0"
          >
            {article.category.name}
          </Link>
          <div className="flex items-center text-xs text-slate-400 gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Link href={`/artigos/${article.id}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 mb-2 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <span>{article.title}</span>
          </h3>
        </Link>

        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{article.summary}</p>
      </div>

      {/* Footer Attachments & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {article.attachments && article.attachments.length > 0 ? (
          <a
            href={article.attachments[0].fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition shrink-0 max-w-[70%]"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{article.attachments[0].name}</span>
            <Download className="w-3 h-3 shrink-0 ml-0.5 text-emerald-600" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic shrink-0">Regra em texto</span>
        )}

        <Link
          href={`/artigos/${article.id}`}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:translate-x-0.5 transition transform shrink-0 whitespace-nowrap"
        >
          <span>Acessar</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
