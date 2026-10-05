'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Upload,
  FileText,
  Trash2,
  Edit2,
  Shield,
  LogOut,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layout,
  Lock,
  KeyRound,
  Video,
} from 'lucide-react';

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
  videoUrl?: string | null;
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

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Form State for Article
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Form State for Editable Hero Banner
  const [bannerBadgeText, setBannerBadgeText] = useState('Regras & Manuais Safra 2025/2026');
  const [bannerTitle, setBannerTitle] = useState('Hub de apoio Imobiliário, Crédito PJ & Agro');
  const [bannerSubtitle, setBannerSubtitle] = useState(
    'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.'
  );
  const [bannerPrimaryBtnText, setBannerPrimaryBtnText] = useState('Ver Regras & Manuais');
  const [bannerPrimaryBtnUrl, setBannerPrimaryBtnUrl] = useState('/categorias/treinamentos');
  const [savingBanner, setSavingBanner] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ensure categories are loaded if initial list was empty
  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            if (!categoryId) {
              setCategoryId(data[0].id);
            }
          }
        })
        .catch(console.error);
    } else if (!categoryId && categories[0]?.id) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Fetch Banner settings on load
  useEffect(() => {
    fetch('/api/banner')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setBannerBadgeText(data.badgeText || '');
          setBannerTitle(data.title || '');
          setBannerSubtitle(data.subtitle || '');
          setBannerPrimaryBtnText(data.primaryButtonText || '');
          setBannerPrimaryBtnUrl(data.primaryButtonUrl || '/categorias/treinamentos');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    setMessage(null);

    try {
      const res = await fetch('/api/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeText: bannerBadgeText,
          title: bannerTitle,
          subtitle: bannerSubtitle,
          primaryButtonText: bannerPrimaryBtnText,
          primaryButtonUrl: bannerPrimaryBtnUrl,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Banner principal atualizado na Home!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar o banner' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!newPassword || newPassword.trim().length < 4) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'A confirmação não confere com a nova senha.' });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Senha do Painel Admin alterada com sucesso!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Erro ao alterar a senha.' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Falha de comunicação com o servidor.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const resetForm = () => {
    setEditingArticleId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setVideoUrl('');
    setCategoryId(categories[0]?.id || '');
    setAttachments([]);
    setMessage(null);
  };

  const handleEditClick = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setVideoUrl(art.videoUrl || '');
    setCategoryId(art.categoryId);
    setAttachments(art.attachments.map((a) => ({ name: a.name, fileUrl: a.fileUrl })));
    window.scrollTo({ top: 500, behavior: 'smooth' });
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

    const targetCategoryId = categoryId || categories[0]?.id;

    if (!targetCategoryId) {
      setMessage({ type: 'error', text: 'Nenhuma categoria disponível para associar ao material.' });
      setSaving(false);
      return;
    }

    const payload = {
      title,
      summary,
      content,
      videoUrl: videoUrl.trim() || null,
      categoryId: targetCategoryId,
      attachments,
    };

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
          <h1 className="text-2xl font-black mt-1">Gestão de Materiais, Banner & Treinamentos</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
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
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* EDITABLE HERO BANNER CONFIGURATION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-cyan-600" />
            Editar Banner Principal da Home (Avisos Sazonais & Campanhas)
          </h2>
          <span className="text-xs text-slate-400 font-medium">Altere o texto do topo a qualquer momento</span>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">SELINHO / BADGE DO TOPO</label>
              <input
                type="text"
                placeholder="ex: Regras & Manuais Safra 2025/2026 ou Campanha do Mês"
                value={bannerBadgeText}
                onChange={(e) => setBannerBadgeText(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 block mb-1">TÍTULO PRINCIPAL</label>
              <input
                type="text"
                placeholder="ex: Hub de apoio Imobiliário, Crédito PJ & Agro"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">SUBTÍTULO / MENSAGEM DO AVISO</label>
            <textarea
              rows={2}
              placeholder="Descreva detalhes, orientações ou regras vigentes..."
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">TEXTO DO BOTÃO PRINCIPAL</label>
              <input
                type="text"
                value={bannerPrimaryBtnText}
                onChange={(e) => setBannerPrimaryBtnText(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">LINK DO BOTÃO PRINCIPAL</label>
              <input
                type="text"
                value={bannerPrimaryBtnUrl}
                onChange={(e) => setBannerPrimaryBtnUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingBanner}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{savingBanner ? 'Salvando Banner...' : 'Salvar Banner da Home'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Upload / Create Article Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-700" />
            {editingArticleId ? 'Editar Material / Regra' : 'Publicar Novo Material / Treinamento'}
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
                placeholder="ex: Treinamento Financiamento Habitacional Caixa 2026 - Esteira & Checklist"
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
                required
              >
                {categories.length === 0 ? (
                  <option value="">Carregando categorias...</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">RESUMO CURTO (Aparece na Home do site)</label>
            <textarea
              rows={2}
              placeholder="Descreva brevemente as principais orientações, regras ou objetivos deste treinamento..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* VIDEO TRAINING INPUT */}
          <div className="bg-rose-50/60 p-4 sm:p-5 rounded-2xl border border-rose-200/80 space-y-2">
            <label className="text-xs font-black text-rose-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Video className="w-4 h-4 text-rose-600" />
              Vídeo de Treinamento (Opcional — YouTube, Vimeo, Google Drive, Loom ou link direto MP4)
            </label>
            <p className="text-xs text-slate-600">
              Cole o link do vídeo para que os consultores possam assistir à aula ou explicação diretamente na página do material.
            </p>
            <input
              type="url"
              placeholder="ex: https://www.youtube.com/watch?v=... ou https://youtu.be/... ou https://vimeo.com/... ou Google Drive"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              CONTEÚDO / EXPLICAÇÃO DETALHADA DAS REGRAS
            </label>
            <textarea
              rows={6}
              placeholder="Descreva taxas, prazos, exigências, requisitos, orientações e passo a passo de aprovação..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Attachments Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  PDFs & Materiais Anexos
                </h3>
                <p className="text-xs text-slate-500">Faça upload de cartilhas, tabelas e resumos para download dos usuários.</p>
              </div>

              <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Enviando PDF...' : 'Subir Arquivo PDF'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-800 truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition shadow-md"
            >
              {saving ? 'Publicando...' : editingArticleId ? 'Salvar Alterações' : 'Publicar Material'}
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY / PASSWORD MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            Segurança: Alterar Senha de Acesso do Administrador
          </h2>
          <span className="text-xs text-slate-400 font-medium">Troque a senha a qualquer momento</span>
        </div>

        {passwordMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">NOVA SENHA</label>
              <input
                type="password"
                placeholder="Digite a nova senha segura..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">CONFIRMAR NOVA SENHA</label>
              <input
                type="password"
                placeholder="Repita a nova senha..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{changingPassword ? 'Atualizando Senha...' : 'Salvar Nova Senha'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Published Materials List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-4">
        <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
          Materiais Publicados no Sistema ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum material publicado ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {articles.map((art) => (
              <div key={art.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {art.category?.name || 'Geral'}
                    </span>
                    {art.videoUrl && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ▶ Vídeo Aula
                      </span>
                    )}
                    {art.attachments.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {art.attachments.length} anexo(s)
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{art.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{art.summary}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(art)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
