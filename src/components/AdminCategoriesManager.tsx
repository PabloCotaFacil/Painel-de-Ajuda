'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FolderPlus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  FolderOpen,
  FileText,
  Landmark,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: {
    articles?: number;
  };
}

interface AdminCategoriesManagerProps {
  categories: CategoryItem[];
  onCategoriesChanged?: () => void;
}

export default function AdminCategoriesManager({
  categories = [],
  onCategoriesChanged,
}: AdminCategoriesManagerProps) {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingCatId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('folder');
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'folder');
    setMessage(null);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Informe o nome da categoria.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingCatId ? `/api/categories/${editingCatId}` : '/api/categories';
      const method = editingCatId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          icon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar categoria');
      }

      setMessage({
        type: 'success',
        text: editingCatId
          ? `Categoria "${name}" atualizada com sucesso!`
          : `Nova categoria "${name}" criada com sucesso!`,
      });

      resetForm();
      if (typeof onCategoriesChanged === 'function') {
        onCategoriesChanged();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao processar requisição.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    const articleCount = cat._count?.articles ?? 0;
    if (articleCount > 0) {
      alert(
        `Não é possível excluir a categoria "${cat.name}" porque existem ${articleCount} material(is) vinculado(s) a ela.\n\nEdite ou mova os materiais para outra categoria antes de excluir.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${cat.name}"?\n(Esta ação não poderá ser desfeita)`
    );
    if (!confirmDelete) return;

    setDeletingId(cat.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao excluir categoria');
      }

      setMessage({
        type: 'success',
        text: `Categoria "${cat.name}" excluída com sucesso!`,
      });

      if (editingCatId === cat.id) {
        resetForm();
      }

      if (typeof onCategoriesChanged === 'function') {
        onCategoriesChanged();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir categoria.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Notificação */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Formulário de Criação/Edição */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-700" />
              <span>{editingCatId ? 'Editar Categoria' : 'Criar Nova Categoria / Esteira'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Adicione esteiras bancárias ou produtos para organizar manuais, regras e treinamentos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {!editingCatId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIcon('bank-pdf');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Novo Banco (Materiais em PDF)</span>
              </button>
            )}
            {editingCatId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Nome da Categoria / Esteira *
              </label>
              <input
                type="text"
                placeholder="Ex: Financiamento Caixa, Home Equity Itaú, Repasse..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCatId) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    );
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Identificador URL (Slug)
              </label>
              <input
                type="text"
                placeholder="Ex: financiamento-caixa"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Link da categoria: /categorias/{slug || '...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Regras, checklists ou manuais em PDF."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Tipo / Ícone da Categoria
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="bank-pdf">Banco (dentro de Materiais em PDF)</option>
                <option value="folder">Pasta Padrão</option>
                <option value="file">Pasta Principal (Materiais em PDF)</option>
                <option value="home">Casa (Crédito Imobiliário)</option>
                <option value="video">Câmera (Treinamentos)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{saving ? 'Salvando...' : editingCatId ? 'Atualizar Categoria' : 'Adicionar Categoria'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Categorias Cadastradas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <span>Categorias Ativas ({categories.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Categorias disponíveis no painel para organizar resumos, PDFs e treinamentos.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma categoria carregada. Adicione uma no formulário acima.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const articleCount = cat._count?.articles ?? 0;
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition flex flex-col justify-between gap-4 bg-slate-50/50"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${
                          cat.icon === 'bank-pdf'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {cat.icon === 'bank-pdf' ? (
                          <Landmark className="w-4 h-4" />
                        ) : cat.icon === 'file' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <FolderOpen className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {cat.icon === 'bank-pdf' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Banco • PDF
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 truncate max-w-[140px]">
                          /categorias/{cat.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-slate-900 text-sm">{cat.name}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {articleCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cat.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <Link
                      href={`/categorias/${cat.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                        title="Editar categoria"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          articleCount > 0
                            ? 'text-slate-300 hover:text-slate-400 cursor-not-allowed'
                            : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                        }`}
                        title={
                          articleCount > 0
                            ? `Não é possível excluir: existem ${articleCount} material(is) vinculado(s)`
                            : 'Excluir categoria'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
