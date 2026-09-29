import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Download, Calendar, Info, Share2 } from 'lucide-react';

export const revalidate = 0;

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      attachments: true,
    },
  });

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Back Navigation */}
      <Link
        href={`/categorias/${article.category.slug}`}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para {article.category.name}</span>
      </Link>

      {/* Main Article Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 card-shadow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase">
            {article.category.name}
          </span>
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>Atualizado em {formattedDate}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="bg-slate-50 border-l-4 border-cyan-500 p-4 rounded-r-2xl">
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Downloadable PDF attachments section */}
        {article.attachments.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
            <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              Documentos & PDFs para Download
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {article.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-emerald-300 hover:border-emerald-500 transition shadow-sm group"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                      {file.name}
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Formatted Content Body */}
        <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pt-4 border-t border-slate-100">
          {article.content}
        </div>
      </div>
    </div>
  );
}
