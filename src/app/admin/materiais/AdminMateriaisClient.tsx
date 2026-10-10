'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  User,
  Video,
  Search,
  ExternalLink,
  BookOpen,
  FolderOpen,
  ArrowRight,
  Home,
  Building2,
  Sprout,
  DollarSign,
  Play,
  RefreshCw,
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import RichTextEditor from '@/components/RichTextEditor';

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

  // Navigation tab state: 'list' (Materiais Disponíveis), 'editor' (Criar/Editar), 'banner' (Banner da Home), 'password' (Segurança)
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'banner' | 'password'>(
    initialArticles.length > 0 ? 'list' : 'editor'
  );

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Search and filter in articles list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form State for Article
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkDocName, setLinkDocName] = useState('');
  const [linkDocUrl, setLinkDocUrl] = useState('');
  const [showAddLinkDoc, setShowAddLinkDoc] = useState(false);

  // Form State for Editable Hero Banner
  const [bannerBadgeText, setBannerBadgeText] = useState('Regras & Manuais Safra 2025/2026');
  const [bannerTitle, setBannerTitle] = useState('Como podemos te ajudar?');
  const [bannerSubtitle, setBannerSubtitle] = useState(
    'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.'
  );
  const [bannerPrimaryBtnText, setBannerPrimaryBtnText] = useState('Ver Regras & Manuais');
  const [bannerPrimaryBtnUrl, setBannerPrimaryBtnUrl] = useState('/categorias/treinamentos');
  const [bannerMediaType, setBannerMediaType] = useState<'cards' | 'video'>('cards');
  const [bannerVideoUrl, setBannerVideoUrl] = useState('');
  const [bannerVideoTitle, setBannerVideoTitle] = useState('');
  const [bannerCards, setBannerCards] = useState<Array<{
    id: string;
    title: string;
    subtitle: string;
    url: string;
    icon: string;
    color: string;
  }>>([
    {
      id: '1',
      title: 'Crédito Imobiliário',
      subtitle: 'LTV, esteiras Caixa, Itaú, BB e Santander',
      url: '/categorias/credito-imobiliario',
      icon: 'home',
      color: 'blue',
    },
    {
      id: '2',
      title: 'Crédito PJ & Capital de Giro',
      subtitle: 'Pronampe, FGO e Antecipação de Recebíveis',
      url: '/categorias/credito-pj',
      icon: 'building',
      color: 'emerald',
    },
    {
      id: '3',
      title: 'Crédito Agro & CPR',
      subtitle: 'Custeio, Investimento e Financiamento Rural',
      url: '/categorias/credito-agro',
      icon: 'sprout',
      color: 'cyan',
    },
  ]);
  const [savingBanner, setSavingBanner] = useState(false);

  const handleAddBannerCard = () => {
    setBannerCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: 'Novo Atalho',
        subtitle: 'Descrição ou esteira operacional',
        url: '/categorias/treinamentos',
        icon: 'file',
        color: 'blue',
      },
    ]);
  };

  const handleUpdateBannerCard = (id: string, field: string, value: string) => {
    setBannerCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveBannerCard = (id: string) => {
    setBannerCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetBannerCards = () => {
    setBannerCards([
      {
        id: '1',
        title: 'Crédito Imobiliário',
        subtitle: 'LTV, esteiras Caixa, Itaú, BB e Santander',
        url: '/categorias/credito-imobiliario',
        icon: 'home',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Crédito PJ & Capital de Giro',
        subtitle: 'Pronampe, FGO e Antecipação de Recebíveis',
        url: '/categorias/credito-pj',
        icon: 'building',
        color: 'emerald',
      },
      {
        id: '3',
        title: 'Crédito Agro & CPR',
        subtitle: 'Custeio, Investimento e Financiamento Rural',
        url: '/categorias/credito-agro',
        icon: 'sprout',
        color: 'cyan',
      },
    ]);
  };

  // Credentials (User & Password) State
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingCredentials, setChangingCredentials] = useState(false);
  const [credentialsMessage, setCredentialsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current admin username on load
  useEffect(() => {
    fetch('/api/auth/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data?.username) {
          setCurrentUsername(data.username);
          setNewUsername(data.username);
        }
      })
      .catch(() => {});
  }, []);

  // Check URL query for ?edit=ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) {
        const found = initialArticles.find((a) => a.id === editId);
        if (found) {
          handleEditClick(found);
        }
      }
    }
  }, [initialArticles]);

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
          setBannerMediaType(data.mediaType || 'cards');
          setBannerVideoUrl(data.videoUrl || '');
          setBannerVideoTitle(data.videoTitle || '');
          if (data.cardsJson) {
            try {
              const parsed = JSON.parse(data.cardsJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBannerCards(parsed);
              }
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBanner = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
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
          mediaType: bannerMediaType,
          videoUrl: bannerVideoUrl.trim(),
          videoTitle: bannerVideoTitle.trim(),
          cardsJson: JSON.stringify(bannerCards),
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage({ type: 'success', text: 'Banner principal atualizado na Home com sucesso!' });
        router.refresh();
      } else {
        if (res.status === 401) {
          setMessage({
            type: 'error',
            text: 'Sua sessão expirou ou você não está logado. Por favor, acerte seu login.',
          });
        } else {
          setMessage({
            type: 'error',
            text: data?.error || 'Erro ao atualizar o banner no servidor.',
          });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erro de conexão com o servidor ao salvar o banner.' });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage(null);

    if (newPassword && newPassword.trim().length < 4) {
      setCredentialsMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredentialsMessage({ type: 'error', text: 'A confirmação não confere com a nova senha.' });
      return;
    }

    if (newUsername.trim().length < 3) {
      setCredentialsMessage({ type: 'error', text: 'O nome de usuário deve ter no mínimo 3 caracteres.' });
      return;
    }

    setChangingCredentials(true);

    try {
      const res = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: newUsername.trim(),
          newPassword: newPassword ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCredentialsMessage({
          type: 'success',
          text: 'Credenciais de acesso (Login e Senha) atualizadas com sucesso!',
        });
        setCurrentUsername(newUsername.trim());
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setCredentialsMessage({ type: 'error', text: data.error || 'Erro ao alterar credenciais.' });
      }
    } catch (err) {
      setCredentialsMessage({ type: 'error', text: 'Falha de comunicação com o servidor.' });
    } finally {
      setChangingCredentials(false);
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
    setActiveTab('editor');
    window.scrollTo({ top: 120, behavior: 'smooth' });
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

    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Preencha o conteúdo das regras antes de salvar.' });
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
          text: editingArticleId
            ? 'Material atualizado com sucesso no site!'
            : 'Novo material publicado com sucesso no site!',
        });

        // Update local articles state
        if (editingArticleId) {
          setArticles((prev) =>
            prev.map((a) => (a.id === editingArticleId ? { ...a, ...data } : a))
          );
        } else {
          setArticles((prev) => [data, ...prev]);
        }

        resetForm();
        setActiveTab('list');
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

  const handleDelete = async (id: string, materialTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o material "${materialTitle}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setMessage({ type: 'success', text: `Material "${materialTitle}" excluído com sucesso.` });
        if (editingArticleId === id) {
          resetForm();
        }
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

  // Filter articles based on search and category
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || art.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Painel Administrativo Privado
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Gestão de Materiais, Treinamentos & Regras</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Conectado como: <strong className="text-cyan-300">{currentUsername}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Ver Portal Público</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 card-shadow flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'list'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Materiais Cadastrados ({articles.length})</span>
        </button>

        <button
          onClick={() => {
            resetForm();
            setActiveTab('editor');
          }}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'editor' && !editingArticleId
              ? 'bg-blue-700 text-white shadow-md'
              : activeTab === 'editor' && editingArticleId
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {editingArticleId ? (
            <>
              <Edit2 className="w-4 h-4" />
              <span>Editando Material Atual</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Publicar Novo Material</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('banner')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'banner'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Banner da Home</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'password'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Login & Senha</span>
        </button>
      </div>

      {/* Global Notification Banner */}
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

      {/* TAB 1: LISTA DE MATERIAIS DISPONÍVEIS COM BUSCA E EDIÇÃO */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                Materiais Cadastrados no Sistema ({articles.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Aqui você pode visualizar, editar ou excluir qualquer regra, PDF ou treinamento já publicado.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setActiveTab('editor');
              }}
              className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Material</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Buscar material por título, palavras-chave ou regras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Table / Cards */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                {searchTerm || selectedCategoryFilter !== 'all'
                  ? 'Nenhum material encontrado com esses filtros.'
                  : 'Nenhum material cadastrado ainda.'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('editor');
                }}
                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 hover:underline"
              >
                <span>Clique aqui para publicar o primeiro material</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                        {art.category?.name || 'Geral'}
                      </span>
                      {art.videoUrl && (
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Video className="w-3 h-3 text-rose-600" />
                          <span>Vídeo Integrado</span>
                        </span>
                      )}
                      {art.attachments.length > 0 && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {art.attachments.length} PDF(s)
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{art.summary}</p>
                  </div>

                  {/* Action Buttons: EDIT, VIEW, DELETE */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <Link
                      href={`/artigos/${art.id}`}
                      target="_blank"
                      className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      title="Ver no site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ver no Site</span>
                    </Link>

                    <button
                      onClick={() => handleEditClick(art)}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Material</span>
                    </button>

                    <button
                      onClick={() => handleDelete(art.id, art.title)}
                      className="p-2 sm:px-3 sm:py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      title="Excluir material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORMULÁRIO DE CRIAR / EDITAR MATERIAL COM RICH TEXT EDITOR */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                {editingArticleId ? (
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Modo Edição Ativo
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Novo Cadastro
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                {editingArticleId ? <Edit2 className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-700" />}
                {editingArticleId ? `Editando: ${title || 'Material Selecionado'}` : 'Publicar Novo Material / Treinamento'}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              {editingArticleId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                >
                  Cancelar Edição
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Voltar à Lista ({articles.length})
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                RESUMO CURTO (Aparece no card na tela inicial)
              </label>
              <textarea
                rows={2}
                placeholder="Descreva brevemente as principais orientações, regras ou objetivos deste material..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* VIDEO TRAINING INPUT & LIVE INLINE PREVIEW */}
            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-rose-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Video className="w-4 h-4 text-rose-600" />
                  Link do Vídeo do YouTube (Toca Direto no Sistema sem Sair)
                </label>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                  Reprodutor Integrado
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cole o link do vídeo do YouTube (inclusive vídeos Não Listados, Shorts ou links normais). O vídeo toca diretamente dentro da página sem redirecionar para outro site.
              </p>
              <input
                type="url"
                placeholder="ex: https://www.youtube.com/watch?v=... ou https://youtu.be/... ou Vimeo / Google Drive"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-rose-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              {/* LIVE PLAYER PREVIEW RIGHT INSIDE ADMIN */}
              {videoUrl.trim() && (
                <div className="pt-2">
                  <p className="text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Pré-visualização do Reprodutor Integrado:</span>
                  </p>
                  <VideoPlayer url={videoUrl} title={title || 'Prévia do Vídeo de Treinamento'} />
                </div>
              )}
            </div>

            {/* RICH TEXT EDITOR SECTION */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-700" />
                  CONTEÚDO DETALHADO & REGRAS (EDITOR AVANÇADO)
                </label>
                <span className="text-[11px] text-slate-500">
                  Use os botões da barra para mudar a <strong className="text-rose-600">cor das letras para vermelho</strong>, adicionar títulos e caixas de alerta.
                </span>
              </div>

              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escreva taxas, prazos, exigências, requisitos, orientações e passo a passo de aprovação..."
              />
            </div>

            {/* Attachments Section */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    PDFs & Materiais Anexos para Download
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faça upload de manuais, checklists e tabelas para os usuários baixarem.
                  </p>
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

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {editingArticleId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar Edição
                </button>
              ) : (
                <div></div>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 text-white font-extrabold rounded-xl text-sm transition shadow-md ${
                  editingArticleId
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {saving
                  ? 'Salvando...'
                  : editingArticleId
                  ? 'Salvar Alterações do Material'
                  : 'Publicar Novo Material'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MOLDAR BANNER DA HOME */}
      {activeTab === 'banner' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-700" />
                Personalizar & Moldar Banner da Home
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Ajuste os textos de boas-vindas, adicione atalhos/cards clicáveis para links externos e materiais, ou insira um reprodutor de vídeo do YouTube em destaque.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveBanner}
              disabled={savingBanner}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center space-x-2 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{savingBanner ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-6">
            {/* BLOCO 1: TEXTOS DO BANNER */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-600" />
                1. Textos Principais do Banner
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    SELINHO / BADGE DO TOPO
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Regras & Manuais Safra 2025/2026"
                    value={bannerBadgeText}
                    onChange={(e) => setBannerBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    TÍTULO DA CHAMADA
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Como podemos te ajudar?"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  SUBTÍTULO / MENSAGEM
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva detalhes, orientações ou regras vigentes..."
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* BLOCO 2: FORMATO DA LATERAL DIREITA DO BANNER */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    2. Conteúdo da Lateral Direita do Banner
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Escolha se deseja exibir atalhos/cards clicáveis ou um reprodutor de vídeo integrado no banner.
                  </p>
                </div>

                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setBannerMediaType('cards')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-1.5 ${
                      bannerMediaType === 'cards'
                        ? 'bg-blue-700 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cards Clicáveis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerMediaType('video')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-1.5 ${
                      bannerMediaType === 'video'
                        ? 'bg-blue-700 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vídeo Integrado</span>
                  </button>
                </div>
              </div>

              {/* OPÇÃO 1: CARDS CLICÁVEIS */}
              {bannerMediaType === 'cards' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Cards ativos no banner ({bannerCards.length}):
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleResetBannerCards}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restaurar Padrão</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBannerCard}
                        className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Novo Card</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {bannerCards.map((card, index) => (
                      <div
                        key={card.id || index}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px]">
                              {index + 1}
                            </span>
                            {card.title || 'Sem título'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBannerCard(card.id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition"
                            title="Remover este card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">
                              TÍTULO DO CARD
                            </label>
                            <input
                              type="text"
                              placeholder="ex: Crédito Imobiliário"
                              value={card.title}
                              onChange={(e) =>
                                handleUpdateBannerCard(card.id, 'title', e.target.value)
                              }
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">
                              DESCRIÇÃO / SUBTÍTULO
                            </label>
                            <input
                              type="text"
                              placeholder="ex: LTV, esteiras Caixa e Itaú"
                              value={card.subtitle}
                              onChange={(e) =>
                                handleUpdateBannerCard(card.id, 'subtitle', e.target.value)
                              }
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">
                              LINK DE DESTINO (URL)
                            </label>
                            <input
                              type="text"
                              placeholder="ex: /categorias/credito-imobiliario ou https://..."
                              value={card.url}
                              onChange={(e) =>
                                handleUpdateBannerCard(card.id, 'url', e.target.value)
                              }
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                ÍCONE
                              </label>
                              <select
                                value={card.icon}
                                onChange={(e) =>
                                  handleUpdateBannerCard(card.id, 'icon', e.target.value)
                                }
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                              >
                                <option value="home">Imóvel (Casa)</option>
                                <option value="building">Empresa (PJ)</option>
                                <option value="sprout">Agro (Planta)</option>
                                <option value="video">Vídeo</option>
                                <option value="file">Documento</option>
                                <option value="dollar">Cifrão ($)</option>
                                <option value="star">Destaque (Estrela)</option>
                                <option value="link">Link Externo</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                COR DO ÍCONE
                              </label>
                              <select
                                value={card.color}
                                onChange={(e) =>
                                  handleUpdateBannerCard(card.id, 'color', e.target.value)
                                }
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                              >
                                <option value="blue">Azul</option>
                                <option value="emerald">Verde</option>
                                <option value="cyan">Ciano</option>
                                <option value="purple">Roxo</option>
                                <option value="amber">Âmbar</option>
                                <option value="rose">Vermelho</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPÇÃO 2: REPRODUTOR DE VÍDEO INTEGRADO */}
              {bannerMediaType === 'video' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 text-xs leading-relaxed">
                    💡 <strong>Dica:</strong> Cole o link de qualquer vídeo do <strong>YouTube</strong> (ex: <code>https://www.youtube.com/watch?v=...</code> ou <code>https://youtu.be/...</code>), Vimeo ou Loom. O reprodutor será exibido dentro do banner da página inicial para que todos assistam sem sair do portal!
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 block mb-1">
                        LINK / URL DO VÍDEO (YOUTUBE, VIMEO, LOOM)
                      </label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                        value={bannerVideoUrl}
                        onChange={(e) => setBannerVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 block mb-1">
                        TÍTULO DO VÍDEO NO BANNER
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Treinamento Oficial Safra 2026"
                        value={bannerVideoTitle}
                        onChange={(e) => setBannerVideoTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {bannerVideoUrl.trim() && (
                    <div className="pt-2">
                      <label className="text-xs font-extrabold text-slate-700 block mb-2">
                        Pré-visualização do Reprodutor:
                      </label>
                      <div className="max-w-xl mx-auto">
                        <VideoPlayer
                          url={bannerVideoUrl}
                          title={bannerVideoTitle || 'Vídeo do Banner'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingBanner}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>{savingBanner ? 'Salvando Configurações...' : 'Salvar Banner da Home'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ALTERAÇÃO DE LOGIN E SENHA */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                Segurança: Alterar Usuário (Login) e Senha do Administrador
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Defina o login e senha que você usará para entrar no Painel Administrativo.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Login atual: <strong className="text-slate-700">{currentUsername}</strong>
            </span>
          </div>

          {credentialsMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                credentialsMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {credentialsMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{credentialsMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangeCredentials} className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                USUÁRIO / LOGIN DE ACESSO
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="ex: admin ou seu nome"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Este é o nome de usuário que será solicitado na tela de login.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  NOVA SENHA (Opcional - deixe em branco para não alterar)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Digite a nova senha segura..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  CONFIRMAR NOVA SENHA
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repita a nova senha..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changingCredentials}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{changingCredentials ? 'Salvando...' : 'Salvar Novo Login & Senha'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
