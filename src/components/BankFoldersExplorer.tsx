'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Landmark,
  ExternalLink,
  FileText,
  Download,
  Eye,
  X,
  ChevronRight,
  Search,
  FolderClosed,
  ArrowLeft,
} from 'lucide-react';
import type { BankFolder, BankColor } from '@/lib/bankFolders';

export interface SimplePdfArticleRef {
  id: string;
  title: string;
  summary: string;
  attachments: Array<{ id: string; name: string; fileUrl?: string }>;
}

const COLOR_STYLES: Record<
  BankColor,
  { badge: string; border: string; lightBg: string; ring: string }
> = {
  blue: {
    badge: 'bg-blue-600 text-white',
    border: 'border-blue-200 dark:border-blue-800/70',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    ring: 'hover:border-blue-400',
  },
  orange: {
    badge: 'bg-orange-500 text-white',
    border: 'border-orange-200 dark:border-orange-800/70',
    lightBg: 'bg-orange-50/70 dark:bg-orange-950/30',
    ring: 'hover:border-orange-400',
  },
  red: {
    badge: 'bg-rose-600 text-white',
    border: 'border-rose-200 dark:border-rose-800/70',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    ring: 'hover:border-rose-400',
  },
  yellow: {
    badge: 'bg-amber-400 text-slate-950',
    border: 'border-amber-200 dark:border-amber-800/70',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    ring: 'hover:border-amber-400',
  },
  purple: {
    badge: 'bg-purple-600 text-white',
    border: 'border-purple-200 dark:border-purple-800/70',
    lightBg: 'bg-purple-50/70 dark:bg-purple-950/30',
    ring: 'hover:border-purple-400',
  },
  emerald: {
    badge: 'bg-emerald-600 text-white',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    ring: 'hover:border-emerald-400',
  },
  cyan: {
    badge: 'bg-cyan-600 text-white',
    border: 'border-cyan-200 dark:border-cyan-800/70',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    ring: 'hover:border-cyan-400',
  },
  slate: {
    badge: 'bg-slate-700 text-white',
    border: 'border-slate-200 dark:border-slate-700',
    lightBg: 'bg-slate-50/70 dark:bg-slate-800/40',
    ring: 'hover:border-slate-400',
  },
};

function getPreviewUrl(fileUrl: string): string {
  const match = fileUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return fileUrl;
}

function handleDownloadPdf(fileUrl: string, fileName: string) {
  if (fileUrl.startsWith('data:')) {
    try {
      const [header, base64Data] = fileUrl.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const byteString = atob(base64Data || '');
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    } catch {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function BankFoldersExplorer({
  bankFolders,
  pdfArticles = [],
  mode = 'banner',
}: {
  bankFolders: BankFolder[];
  pdfArticles?: SimplePdfArticleRef[];
  mode?: 'banner' | 'page';
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>(bankFolders[0]?.id || '');
  const [previewFile, setPreviewFile] = useState<{ name: string; fileUrl: string } | null>(null);
  const [searchBank, setSearchBank] = useState('');

  const filteredBanks = useMemo(() => {
    const q = searchBank.trim().toLowerCase();
    if (!q) return bankFolders;
    return bankFolders.filter(
      (b) =>
        b.bankName.toLowerCase().includes(q) ||
        b.shortCode.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [bankFolders, searchBank]);

  const activeBank =
    bankFolders.find((b) => b.id === selectedBankId) || bankFolders[0] || null;

  // Encontra artigos com PDF que citam o nome do banco selecionado no título
  const matchingPdfArticles = useMemo(() => {
    if (!activeBank || pdfArticles.length === 0) return [];
    const tokens = activeBank.bankName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !['banco', 'do', 'da', 'de'].includes(t));

    return pdfArticles.filter((art) => {
      if (!art.attachments || art.attachments.length === 0) return false;
      const titleNorm = art.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return tokens.some((token) => titleNorm.includes(token));
    });
  }, [activeBank, pdfArticles]);

  const openBankSubfolder = (bankId?: string) => {
    if (bankId) setSelectedBankId(bankId);
    setPreviewFile(null);
    setIsModalOpen(true);
  };

  const renderActiveBankContent = () => {
    if (!activeBank) {
      return (
        <div className="p-8 text-center text-sm text-slate-500">
          Nenhuma pasta bancária configurada ainda.
        </div>
      );
    }

    const styles = COLOR_STYLES[activeBank.color] || COLOR_STYLES.blue;

    return (
      <div className="space-y-5">
        {/* Cabeçalho do Banco Selecionado */}
        <div
          className={`rounded-2xl p-5 border ${styles.border} ${styles.lightBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 shadow-md ${styles.badge}`}
            >
              {activeBank.shortCode}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Subpasta do Banco
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {activeBank.files.length + matchingPdfArticles.reduce((acc, a) => acc + a.attachments.length, 0)} PDF(s)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {activeBank.bankName}
              </h3>
              {activeBank.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {activeBank.description}
                </p>
              )}
            </div>
          </div>

          {activeBank.driveUrl ? (
            <a
              href={activeBank.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-md transition shrink-0"
            >
              <FolderOpen className="w-4 h-4 text-cyan-300" />
              <span>Abrir Pasta no Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-xl shrink-0">
              Pasta do Drive pendente no Admin
            </span>
          )}
        </div>

        {/* Visualizador de PDF embutido */}
        {previewFile && (
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
            <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white truncate">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{previewFile.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewFile.fileUrl, previewFile.name)}
                  className="text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  title="Fechar visualização"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={getPreviewUrl(previewFile.fileUrl)}
              className="w-full h-[460px] bg-white border-0"
              title={previewFile.name}
            />
          </div>
        )}

        {/* Lista de PDFs cadastrados diretamente na pasta do banco */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-500" />
            <span>PDFs & Formulários — {activeBank.bankName}</span>
          </h4>

          {activeBank.files.length === 0 && matchingPdfArticles.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 text-center space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {activeBank.driveUrl
                  ? `Os PDFs de ${activeBank.bankName} estão disponíveis diretamente no botão "Abrir Pasta no Google Drive" acima.`
                  : `Ainda não há PDFs ou pasta do Drive cadastrados para ${activeBank.bankName}.`}
              </p>
              <p className="text-[11px] text-slate-400">
                No Painel Admin → aba &quot;Pastas dos Bancos (Drive/PDFs)&quot;, é possível subir os PDFs individuais ou colar o link da pasta do Drive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {activeBank.files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Material PDF • {activeBank.bankName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setPreviewFile({ name: file.name, fileUrl: file.fileUrl })}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(file.fileUrl, file.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Artigos da categoria com PDF cujo título menciona o banco */}
              {matchingPdfArticles.map((art) =>
                art.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {att.name}
                        </p>
                        <Link
                          href={`/artigos/${art.id}`}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          Vinculado a: {art.title} ↗
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {att.fileUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewFile({ name: att.name, fileUrl: att.fileUrl! })
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(att.fileUrl!, att.name)}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          href={`/artigos/${art.id}#pdf-viewer-section`}
                          onClick={() => setIsModalOpen(false)}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir PDF do Material</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (mode === 'page') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 card-shadow space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                <FolderOpen className="w-4 h-4" />
                <span>Subpasta de Drives & Documentos por Banco</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Pastas Específicas dos Bancos (PDFs & Drive)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Escolha o banco abaixo para abrir a pasta do Google Drive ou baixar os formulários e PDFs específicos sem precisar procurar no meio dos resumos gerais.
              </p>
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Buscar banco (Caixa, Itaú, BB...)"
                value={searchBank}
                onChange={(e) => setSearchBank(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subpastas laterais (Bancos) */}
            <div className="lg:col-span-4 space-y-2.5">
              {filteredBanks.map((bank) => {
                const styles = COLOR_STYLES[bank.color] || COLOR_STYLES.blue;
                const isSelected = activeBank?.id === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => {
                      setSelectedBankId(bank.id);
                      setPreviewFile(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-10 h-10 rounded-xl font-black text-[11px] flex items-center justify-center shrink-0 ${styles.badge}`}
                      >
                        {bank.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {bank.bankName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{bank.files.length} PDF(s)</span>
                          {bank.driveUrl && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              • Drive ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Painel da Subpasta Aberta */}
            <div className="lg:col-span-8 bg-slate-50/50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
              {renderActiveBankContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo Banner + Gaveta Modal (para Crédito Imobiliário / Home)
  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-blue-800/60 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
              <FolderClosed className="w-3.5 h-3.5" />
              <span>Subpasta Separada • PDFs & Drive dos Bancos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Landmark className="w-6 h-6 text-cyan-400 shrink-0" />
              <span>Materiais Específicos por Banco (PDFs & Drive)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Para não misturar com os resumos gerais e regras operacionais, os{' '}
              <strong className="text-white">PDFs e pastas do Google Drive de cada banco</strong> ficam organizados aqui. Selecione um banco abaixo para abrir sua pasta!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openBankSubfolder(bankFolders[0]?.id)}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Acessar Pastas dos Bancos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Botões Rápidos por Banco (Subpastas) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {bankFolders.map((bank) => {
            const styles = COLOR_STYLES[bank.color] || COLOR_STYLES.blue;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => openBankSubfolder(bank.id)}
                className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-cyan-400/60 rounded-2xl p-3 text-left transition flex items-center gap-3"
              >
                <span
                  className={`w-9 h-9 rounded-xl font-black text-[10px] flex items-center justify-center shrink-0 shadow ${styles.badge}`}
                >
                  {bank.shortCode}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-white truncate group-hover:text-cyan-300 transition">
                    {bank.bankName}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                    <span>{bank.files.length} PDF(s)</span>
                    {bank.driveUrl && <span className="text-emerald-300 font-bold">• Drive</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Modal / Subpasta de Pastas dos Bancos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Barra superior do Modal */}
            <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black truncate">
                    Subpasta de Drives & PDFs por Banco
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">
                    Selecione o banco ao lado para abrir sua pasta do Google Drive ou baixar os PDFs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/bancos"
                  onClick={() => setIsModalOpen(false)}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg"
                >
                  <span>Tela Cheia</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo com Lista de Bancos + Conteúdo da Subpasta */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Lista de Bancos */}
              <div className="md:col-span-4 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-1">
                  Escolha o Banco:
                </div>
                {bankFolders.map((bank) => {
                  const styles = COLOR_STYLES[bank.color] || COLOR_STYLES.blue;
                  const isSelected = activeBank?.id === bank.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setSelectedBankId(bank.id);
                        setPreviewFile(null);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 ${styles.badge}`}
                        >
                          {bank.shortCode}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {bank.bankName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {bank.files.length} PDF(s){bank.driveUrl ? ' • Drive ✓' : ''}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Detalhe do Banco Selecionado */}
              <div className="md:col-span-8">
                {renderActiveBankContent()}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para os Resumos Gerais</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-blue-700 text-white text-xs font-extrabold rounded-xl"
              >
                Fechar Pasta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
