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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow hover:border-cotafacil-teal transition flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/categorias/${article.category.slug}`}
            className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-cotafacil-teal hover:bg-cotafacil-teal hover:text-white transition uppercase"
          >
            {article.category.name}
          </Link>
          <div className="flex items-center text-xs text-slate-400 gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Link href={`/artigos/${article.id}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-cotafacil-orange transition line-clamp-2 mb-2 flex items-start gap-1.5">
            <Info className="w-4 h-4 text-cotafacil-teal shrink-0 mt-1" />
            <span>{article.title}</span>
          </h3>
        </Link>

        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{article.summary}</p>
      </div>

      {/* Footer Attachments & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {article.attachments && article.attachments.length > 0 ? (
          <a
            href={article.attachments[0].fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-cotafacil-teal hover:text-cotafacil-tealDark bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <FileText className="w-3.5 h-3.5 text-cotafacil-orange" />
            <span className="truncate max-w-[150px]">{article.attachments[0].name}</span>
            <Download className="w-3 h-3 ml-1 text-slate-500" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">Regra em texto</span>
        )}

        <Link
          href={`/artigos/${article.id}`}
          className="text-xs font-bold text-cotafacil-teal hover:text-cotafacil-tealDark flex items-center gap-1 group-hover:translate-x-0.5 transition transform"
        >
          <span>Acessar</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
