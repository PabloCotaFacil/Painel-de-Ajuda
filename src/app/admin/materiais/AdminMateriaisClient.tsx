'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Upload, FileText, Trash2, Edit2, Shield, Percent, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

interface Attachment {
  id?: string;
  name: string;
  fileUrl: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  category: Category;
  attachments: Attachment[];
}

export default function AdminMateriaisClient({
  initialCategories,
  initialArticles,
}: {
  initialCategories: Category[];
  initialArticles: Article[];
}) {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingArticleId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setCategoryId(initialCategories[0]?.id || '');
    setAttachments([]);
    setMessage(null);
  };

  const handleEditClick = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setCategoryId(art.categoryId);
    setAttachments(art.attachments.map((a) => ({ name: a.name, fileUrl: a.fileUrl })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAttachments((prev) => [...prev, { name: data.fileName, fileUrl: data.fileUrl }]);
        setMessage({ type: 'success', text: `Arquivo ${data.fileName} enviado com sucesso!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar arquivo' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Falha no upload do PDF' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = { title, summary, content, categoryId, attachments };

    try {
      const url = editingArticleId ? `/api/articles/${editingArticleId}` : '/api/articles';
      const method = editingArticleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingArticleId ? 'Material atualizado com sucesso!' : 'Novo material publicado no site!',
        });
        resetForm();
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar material' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setMessage({ type: 'success', text: 'Material excluído com sucesso' });
        router.refresh();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao excluir material' });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Painel Administrativo Privado</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Gestão de Materiais & Upload de PDFs</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/comissoes"
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            <Percent className="w-4 h-4" />
            <span>Gerenciar Gatilhos de Comissão</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-3.5 py-2 rounded-xl text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Upload / Create Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-700" />
            {editingArticleId ? 'Editar Material / Regra' : 'Publicar Novo Material / Anexar PDF'}
          </h2>
          {editingArticleId && (
            <button onClick={resetForm} className="text-xs font-bold text-slate-500 hover:underline">
              Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 block mb-1">TÍTULO DO MATERIAL</label>
              <input
                type="text"
                placeholder="ex: Regras de Financiamento Habitação Caixa 2026 - LTV & Regras"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">CATEGORIA</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {initialCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">RESUMO CURTO (Aparece na Home do site)</label>
            <textarea
              rows={2}
              placeholder="Descreva brevemente as principais mudanças ou regras contidas neste material..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">CONTEÚDO COMPLETO OU REGRAS DETALHADAS</label>
            <textarea
              rows={6}
              placeholder="Escreva aqui as taxas, tabelas, condições de enquadramento, documentos necessários..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Upload PDF Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs font-extrabold text-slate-700 block">ANEXAR PDF / ARQUIVO DE TREINAMENTO</label>
            
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Enviando...' : 'Selecionar Arquivo PDF'}</span>
                <input type="file" accept=".pdf,.doc,.docx,.png,.jpg" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              <span className="text-xs text-slate-400">Aceita arquivos PDF, DOCX e Imagens</span>
            </div>

            {/* List attached files */}
            {attachments.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Arquivos Anexados:</span>
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-md">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 font-bold ml-2"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            {editingArticleId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition shadow-lg flex items-center space-x-2"
            >
              <span>{saving ? 'Salvando...' : editingArticleId ? 'Atualizar Material' : 'Publicar Material'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Materials List Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-4">
        <h2 className="text-xl font-black text-slate-900">Materiais Cadastrados no Site</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-3 font-extrabold">Título do Material</th>
                <th className="py-3 px-3 font-extrabold">Categoria</th>
                <th className="py-3 px-3 font-extrabold">Anexos PDF</th>
                <th className="py-3 px-3 font-extrabold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-extrabold text-slate-900 max-w-xs truncate">{art.title}</td>
                  <td className="py-3 px-3">
                    <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      {art.category.name}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {art.attachments.length > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{art.attachments.length} PDF(s)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sem PDF</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(art)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
