'use client';

import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Landmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { BankFolder, BankColor } from '@/lib/bankFolders';

const BANK_COLOR_OPTIONS: Array<{ value: BankColor; label: string; badgeClass: string }> = [
  { value: 'blue', label: 'Azul (Caixa / Padrão)', badgeClass: 'bg-blue-600 text-white' },
  { value: 'orange', label: 'Laranja (Itaú / Inter)', badgeClass: 'bg-orange-500 text-white' },
  { value: 'red', label: 'Vermelho (Santander)', badgeClass: 'bg-rose-600 text-white' },
  { value: 'yellow', label: 'Amarelo (Banco do Brasil)', badgeClass: 'bg-amber-400 text-slate-950' },
  { value: 'purple', label: 'Roxo (Bradesco / Outros)', badgeClass: 'bg-purple-600 text-white' },
  { value: 'emerald', label: 'Verde (Inter / Sicoob)', badgeClass: 'bg-emerald-600 text-white' },
  { value: 'cyan', label: 'Ciano (CashMe / Fintechs)', badgeClass: 'bg-cyan-600 text-white' },
  { value: 'slate', label: 'Grafite / Neutro', badgeClass: 'bg-slate-700 text-white' },
];

export default function AdminBankFoldersManager({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const [folders, setFolders] = useState<BankFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Estado temporário para adicionar link PDF ou upload em cada banco
  const [uploadingBankId, setUploadingBankId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [linkDrafts, setLinkDrafts] = useState<
    Record<string, { name: string; fileUrl: string; note: string }>
  >({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/bank-folders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFolders(data);
          if (data[0]?.id) {
            setExpandedBankId(data[0].id);
          }
        }
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Erro ao carregar pastas dos bancos.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const persistFolders = async (nextFolders: BankFolder[], successMsg?: string) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/bank-folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: nextFolders }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao salvar pastas dos bancos.');
      }
      if (Array.isArray(data?.folders)) {
        setFolders(data.folders);
      }
      setFeedback({
        type: 'success',
        text: successMsg || 'Pastas & PDFs dos bancos salvos e publicados com sucesso!',
      });
      onSaved?.();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Erro ao salvar alterações.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddBank = () => {
    const newId = `bank-${Date.now()}`;
    const newBank: BankFolder = {
      id: newId,
      bankName: 'Novo Banco / Instituição',
      slug: `banco-${Date.now()}`,
      shortCode: 'BNC',
      color: 'blue',
      description: 'PDFs, checklists e pasta do Google Drive específicos deste banco.',
      driveUrl: '',
      files: [],
    };
    setFolders((prev) => [...prev, newBank]);
    setExpandedBankId(newId);
    setFeedback(null);
  };

  const handleUpdateBankField = (
    bankId: string,
    field: keyof BankFolder,
    value: string
  ) => {
    setFolders((prev) =>
      prev.map((bank) => {
        if (bank.id !== bankId) return bank;
        const updated = { ...bank, [field]: value };
        if (field === 'bankName') {
          updated.slug = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        return updated;
      })
    );
  };

  const handleRemoveBank = (bankId: string, bankName: string) => {
    if (!confirm(`Deseja realmente remover a pasta do banco "${bankName}"?`)) return;
    const next = folders.filter((b) => b.id !== bankId);
    setFolders(next);
    persistFolders(next, `Pasta do banco "${bankName}" removida.`);
  };

  const handleAddLinkFileToBank = (bankId: string) => {
    const draft = linkDrafts[bankId] || { name: '', fileUrl: '', note: '' };
    if (!draft.fileUrl.trim()) {
      setFeedback({
        type: 'error',
        text: 'Informe a URL do PDF ou arquivo no Google Drive para adicionar na pasta do banco.',
      });
      return;
    }

    const newFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: draft.name.trim() || 'Documento em PDF (Drive)',
      fileUrl: draft.fileUrl.trim(),
      note: draft.note.trim(),
    };

    const next = folders.map((bank) =>
      bank.id === bankId ? { ...bank, files: [...bank.files, newFile] } : bank
    );
    setFolders(next);
    setLinkDrafts((prev) => ({ ...prev, [bankId]: { name: '', fileUrl: '', note: '' } }));
    persistFolders(next, `PDF "${newFile.name}" adicionado à pasta do banco e salvo!`);
  };

  const handleUploadPdfToBank = async (
    bankId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFeedback({
        type: 'error',
        text: `O arquivo excede ${MAX_SIZE_MB}MB. Use "Anexar Link do Drive" para arquivos maiores.`,
      });
      return;
    }

    setUploadingBankId(bankId);
    setUploadProgress(0);
    setFeedback(null);

    try {
      const CHUNK_SIZE = 1.5 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = `bank-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const readBlobAsBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(',')[1] || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

      let finalUrl = '';
      let finalName = file.name;

      for (let i = 0; i < totalChunks; i++) {
        const chunkBlob = file.slice(i * CHUNK_SIZE, Math.min(file.size, (i + 1) * CHUNK_SIZE));
        const chunkBase64 = await readBlobAsBase64(chunkBlob);

        const res = await fetch('/api/upload/chunk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uploadId,
            chunkIndex: i,
            totalChunks,
            chunkData: chunkBase64,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            fileSize: file.size,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erro ao enviar arquivo em partes.');
        }

        const data = await res.json();
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));

        if (data.completed && data.fileUrl) {
          finalUrl = data.fileUrl;
          finalName = data.fileName || file.name;
        }
      }

      if (!finalUrl) {
        throw new Error('Não foi possível finalizar o upload do PDF.');
      }

      const newFile = {
        id: `file-${Date.now()}`,
        name: finalName,
        fileUrl: finalUrl,
        note: 'PDF Direto',
      };

      const next = folders.map((bank) =>
        bank.id === bankId ? { ...bank, files: [...bank.files, newFile] } : bank
      );
      setFolders(next);
      await persistFolders(next, `PDF "${finalName}" enviado para a pasta do banco!`);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Falha no upload do PDF para o banco.',
      });
    } finally {
      setUploadingBankId(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveFileFromBank = (bankId: string, fileId: string) => {
    const next = folders.map((bank) =>
      bank.id === bankId
        ? { ...bank, files: bank.files.filter((f) => f.id !== fileId) }
        : bank
    );
    setFolders(next);
    persistFolders(next, 'Arquivo removido da pasta do banco.');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs font-bold text-slate-500">
        Carregando pastas dos bancos...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-extrabold uppercase tracking-wider mb-1">
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span>Subpasta de Drives & PDFs por Banco</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Pastas Específicas dos Bancos ({folders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Separe os PDFs específicos de cada banco dos resumos gerais. Cole o <strong>link da pasta do Google Drive</strong> de cada banco e/ou anexe os <strong>PDFs específicos</strong> aqui dentro — os corretores acessam pelo botão de Pastas dos Bancos em Crédito Imobiliário!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddBank}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-4 py-2.5 rounded-xl text-xs transition"
          >
            <Plus className="w-4 h-4 text-blue-700" />
            <span>Adicionar Banco</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => persistFolders(folders)}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Tudo'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {folders.map((bank) => {
          const isExpanded = expandedBankId === bank.id;
          const colorOption =
            BANK_COLOR_OPTIONS.find((c) => c.value === bank.color) || BANK_COLOR_OPTIONS[0];
          const draft = linkDrafts[bank.id] || { name: '', fileUrl: '', note: '' };
          const isUploadingHere = uploadingBankId === bank.id;

          return (
            <div
              key={bank.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden"
            >
              {/* Cabeçalho do Banco */}
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-white border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <span
                    className={`w-11 h-11 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-sm ${colorOption.badgeClass}`}
                  >
                    {bank.shortCode || 'BNC'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                        {bank.bankName}
                      </h3>
                      {bank.driveUrl ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ✓ Drive Vinculado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Sem link do Drive ainda
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {bank.files.length} PDF(s) anexado(s)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{bank.description}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  {bank.driveUrl && (
                    <a
                      href={bank.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <span>Abrir Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
                    title={isExpanded ? 'Recolher' : 'Configurar Pasta & PDFs'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBank(bank.id, bank.bankName)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Remover Banco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo Expandido do Banco */}
              {isExpanded && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Nome do Banco *
                      </label>
                      <input
                        type="text"
                        value={bank.bankName}
                        onChange={(e) => handleUpdateBankField(bank.id, 'bankName', e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Sigla / Etiqueta
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={bank.shortCode}
                        onChange={(e) =>
                          handleUpdateBankField(bank.id, 'shortCode', e.target.value.toUpperCase())
                        }
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Cor do Selo
                      </label>
                      <select
                        value={bank.color}
                        onChange={(e) => handleUpdateBankField(bank.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        {BANK_COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Link da Pasta do Google Drive deste Banco (Subpasta)
                      </label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={bank.driveUrl}
                        onChange={(e) => handleUpdateBankField(bank.id, 'driveUrl', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Descrição Curta dos Materiais
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Formulários, checklists, DPS e tabelas PDF do banco"
                        value={bank.description}
                        onChange={(e) =>
                          handleUpdateBankField(bank.id, 'description', e.target.value)
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* PDFs Específicos deste Banco */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-700" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          PDFs & Documentos dentro de {bank.bankName} ({bank.files.length})
                        </h4>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingHere ? `Enviando (${uploadProgress}%)...` : 'Subir PDF do Computador'}</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleUploadPdfToBank(bank.id, e)}
                          className="hidden"
                          disabled={isUploadingHere}
                        />
                      </label>
                    </div>

                    {/* Adicionar PDF por Link (Google Drive / Nuvem) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Nome do PDF (ex: Checklist Habitacional 2026)"
                        value={draft.name}
                        onChange={(e) =>
                          setLinkDrafts((prev) => ({
                            ...prev,
                            [bank.id]: { ...draft, name: e.target.value },
                          }))
                        }
                        className="sm:col-span-4 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Link do PDF no Google Drive / OneDrive..."
                        value={draft.fileUrl}
                        onChange={(e) =>
                          setLinkDrafts((prev) => ({
                            ...prev,
                            [bank.id]: { ...draft, fileUrl: e.target.value },
                          }))
                        }
                        className="sm:col-span-5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddLinkFileToBank(bank.id)}
                        className="sm:col-span-3 inline-flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold px-3 py-2 rounded-lg transition"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>+ Anexar Link PDF</span>
                      </button>
                    </div>

                    {/* Lista de arquivos do banco */}
                    {bank.files.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-3">
                        Nenhum PDF específico anexado aqui ainda. Você pode usar o link da pasta do Drive acima ou subir os PDFs individuais aqui.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bank.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {file.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0">
                                {file.fileUrl.startsWith('/api/files/') || file.fileUrl.startsWith('data:')
                                  ? 'PDF no Sistema'
                                  : 'Link Drive'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-bold text-blue-700 hover:underline"
                              >
                                Abrir
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveFileFromBank(bank.id, file.id)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                                title="Remover PDF"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        persistFolders(folders, `Configurações de "${bank.bankName}" salvas com sucesso!`)
                      }
                      className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações de {bank.bankName}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
