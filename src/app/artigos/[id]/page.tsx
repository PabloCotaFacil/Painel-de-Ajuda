import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Video } from 'lucide-react';
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

  const videoType = (article as any).videoType || 'training';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation & Admin Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/categorias/${article.category.slug}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para {article.category.name}</span>
        </Link>

        <AdminArticleEditButton articleId={article.id} />
      </div>

      {/* Main Article Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 card-shadow space-y-6 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 uppercase">
              {article.category.name}
            </span>
            {article.videoUrl && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                <Video className="w-3.5 h-3.5" />
                <span>
                  {videoType === 'reel' ? 'Pílula Rápida (9:16)' : 'Treinamento Completo (16:9)'}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>Atualizado em {formattedDate}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        <div className="bg-slate-50 dark:bg-slate-800/60 border-l-4 border-cyan-500 p-4 rounded-r-2xl">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Video Player Section if article has video */}
        {article.videoUrl && (
          <VideoPlayer url={article.videoUrl} title={article.title} videoType={videoType} />
        )}

        {/* Downloadable & Viewable PDF attachments section */}
        {article.attachments.length > 0 && (
          <ArticleAttachments attachments={article.attachments} />
        )}

        {/* Formatted Content Body */}
        {article.content.includes('<') && article.content.includes('>') ? (
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed pt-4 border-t border-slate-100 dark:border-slate-800 article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pt-4 border-t border-slate-100 dark:border-slate-800 article-body">
            {article.content}
          </div>
        )}
      </div>
    </div>
  );
}
