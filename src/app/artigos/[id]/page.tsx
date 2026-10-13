import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Download, Calendar, Video } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import AdminArticleEditButton from '@/components/AdminArticleEditButton';
import ArticleAttachments from '@/components/ArticleAttachments';

// Cache inteligente de 60 segundos com ISR para respostas ultrarrápidas
export const revalidate = 60;

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
      {/* Top Navigation & Admin Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/categorias/${article.category.slug}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para {article.category.name}</span>
        </Link>

        <AdminArticleEditButton articleId={article.id} />
      </div>

      {/* Main Article Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 card-shadow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase">
              {article.category.name}
            </span>
            {article.videoUrl && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                <Video className="w-3.5 h-3.5" />
                <span>Vídeo Aula / Treinamento</span>
              </span>
            )}
          </div>
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

        {/* Video Player Section if article has video */}
        {article.videoUrl && (
          <VideoPlayer url={article.videoUrl} title={article.title} />
        )}

        {/* Downloadable & Viewable PDF attachments section */}
        {article.attachments.length > 0 && (
          <ArticleAttachments attachments={article.attachments} />
        )}

        {/* Formatted Content Body */}
        {article.content.includes('<') && article.content.includes('>') ? (
          <div
            className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed pt-4 border-t border-slate-100 article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pt-4 border-t border-slate-100 article-body">
            {article.content}
          </div>
        )}
      </div>
    </div>
  );
}
