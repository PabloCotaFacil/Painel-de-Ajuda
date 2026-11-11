import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getBankFolders } from '@/lib/bankFolders';
import BankFoldersExplorer from '@/components/BankFoldersExplorer';

export const revalidate = 60;

export default async function BancosPage() {
  const [bankFolders, articlesWithPdfs] = await Promise.all([
    getBankFolders(),
    prisma.article.findMany({
      where: {
        attachments: { some: {} },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        attachments: {
          select: {
            id: true,
            name: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-800 shadow-sm transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para a Página Inicial</span>
          </Link>

          <Link
            href="/categorias/imobiliario"
            className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition"
          >
            <Home className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Ir para Resumos de Crédito Imobiliário</span>
          </Link>
        </div>
      </div>

      <BankFoldersExplorer
        bankFolders={bankFolders}
        pdfArticles={articlesWithPdfs}
        mode="page"
      />
    </div>
  );
}
