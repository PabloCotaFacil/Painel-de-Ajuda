'use client';

import { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  MonitorPlay,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import RichTextEditor from '@/components/RichTextEditor';
import AdminReelsManager from '@/components/AdminReelsManager';
import AdminCategoriesManager from '@/components/AdminCategoriesManager';
import { smartSearchArticles } from '@/lib/search';

interface Attachment {
  id?: string;
  name: string;
  fileUrl: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: {
    articles?: number;
  };
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  videoUrl?: string | null;
  videoType?: string | null;
  categoryId: string;
  category: Category;
  attachments: Attachment[];
}

type MaterialKind = 'training_16_9' | 'reel_9_16' | 'manual_pdf' | 'pdf_doc';

export default function AdminMateriaisClient({
  initialCategories,
  initialArticles,
}: {
  initialCategories: Category[];
  initialArticles: Article[];
}) {
  const router = useRouter();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'categories' | 'banner' | 'reels' | 'support' | 'password'>(
    initialArticles.length > 0 ? 'list' : 'editor'
  );

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [togglingVideoTypeId, setTogglingVideoTypeId] = useState<string | null>(null);
  const handledEditQueryRef = useRef<string | null>(null);

  // Search and filter in articles list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'video' | 'manual' | 'pdf'>('all');

  // Form State for Article
  const [materialKind, setMaterialKind] = useState<MaterialKind>('training_16_9');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'reel' | 'training'>('training');
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkDocName, setLinkDocName] = useState('');
  const [linkDocUrl, setLinkDocUrl] = useState('');
  const [showAddLinkDoc, setShowAddLinkDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Form State for Editable Hero Banner
  const [bannerBadgeText, setBannerBadgeText] = useState('Regras & Manuais 2025/2026');
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
      url: '/categorias/imobiliario',
      icon: 'home',
      color: 'blue',
    },
  ]);
  const [savingBanner, setSavingBanner] = useState(false);

  const handleSelectMaterialKind = (kind: MaterialKind) => {
    setMaterialKind(kind);
    if (kind === 'training_16_9') {
      setVideoType('training');
      const treinamentosCat = categories.find((c) => c.slug === 'treinamentos');
      if (treinamentosCat) {
        setCategoryId(treinamentosCat.id);
      } else if (!categoryId && categories[0]?.id) {
        setCategoryId(categories[0].id);
      }
    } else if (kind === 'reel_9_16') {
      setVideoType('reel');
      const treinamentosCat = categories.find((c) => c.slug === 'treinamentos');
      if (treinamentosCat) {
        setCategoryId(treinamentosCat.id);
      } else if (!categoryId && categories[0]?.id) {
        setCategoryId(categories[0].id);
      }
    } else if (kind === 'pdf_doc') {
      setVideoType('training');
      const pdfCat = categories.find((c) => c.slug.includes('pdf') || c.icon === 'file');
      if (pdfCat) {
        setCategoryId(pdfCat.id);
      }
    } else {
      setVideoType('training');
      const imobCat = categories.find((c) => c.slug === 'imobiliario');
      if (imobCat) {
        setCategoryId(imobCat.id);
      }
    }
  };

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
        url: '/categorias/imobiliario',
        icon: 'home',
        color: 'blue',
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

  // Check URL query for ?edit=ID (apenas uma vez por ID para não reabrir após salvar)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId && handledEditQueryRef.current !== editId) {
        const found = initialArticles.find((a) => a.id === editId);
        if (found) {
          handledEditQueryRef.current = editId;
          handleEditClick(found);
        }
      }
    }
  }, [initialArticles]);

  // Recarrega lista completa de categorias atualizadas
  const fetchFreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error('Erro ao recarregar categorias:', err);
    }
  };

  // Support WhatsApp Settings State
  const [supportPhone, setSupportPhone] = useState('5517997750058');
  const [supportMessage, setSupportMessage] = useState(
    'Olá! Estou consultando o Hub de Apoio Operacional CotaFácil e gostaria de tirar uma dúvida sobre uma esteira de crédito imobiliário.'
  );
  const [supportHelpDeskUrl, setSupportHelpDeskUrl] = useState('');
  const [savingSupport, setSavingSupport] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load support settings
  useEffect(() => {
    fetch('/api/support-config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.whatsappNumber) {
          setSupportPhone(data.whatsappNumber);
          if (data.defaultMessage) setSupportMessage(data.defaultMessage);
          if (data.helpDeskUrl !== undefined) setSupportHelpDeskUrl(data.helpDeskUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSupport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSupport(true);
    setSupportFeedback(null);
    try {
      const res = await fetch('/api/support-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappNumber: supportPhone,
          defaultMessage: supportMessage,
          helpDeskUrl: supportHelpDeskUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar configuração de suporte');
      }
      setSupportFeedback({
        type: 'success',
        text: 'Número e configurações do WhatsApp de suporte atualizados com sucesso!',
      });
    } catch (err: any) {
      setSupportFeedback({
        type: 'error',
        text: err.message || 'Erro ao salvar configuração de suporte.',
      });
    } finally {
      setSavingSupport(false);
    }
  };

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
    setMaterialKind('training_16_9');
    setTitle('');
    setSummary('');
    setContent('');
    setVideoUrl('');
    setVideoType('training');
    const treinamentosCat = categories.find((c) => c.slug === 'treinamentos');
    setCategoryId(treinamentosCat?.id || categories[0]?.id || '');
    setAttachments([]);
    setLinkDocName('');
    setLinkDocUrl('');
    setShowAddLinkDoc(false);
    setMessage(null);
    if (typeof window !== 'undefined' && window.location.search.includes('edit=')) {
      window.history.replaceState(null, '', '/admin/materiais');
    }
  };

  const handleEditClick = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setVideoUrl(art.videoUrl || '');
    const isReelVideo =
      art.videoType === 'reel' ||
      (art.videoUrl?.includes('/shorts/') && art.videoType !== 'training');

    setVideoType(isReelVideo ? 'reel' : 'training');
    const isPdfCategory = art.category?.slug?.includes('pdf') || art.category?.icon === 'file';
    if (!art.videoUrl) {
      setMaterialKind(isPdfCategory || art.attachments?.length > 0 ? 'pdf_doc' : 'manual_pdf');
    } else if (isReelVideo) {
      setMaterialKind('reel_9_16');
    } else {
      setMaterialKind('training_16_9');
    }
    setCategoryId(art.categoryId);
    setAttachments(art.attachments.map((a) => ({ name: a.name, fileUrl: a.fileUrl })));
    setActiveTab('editor');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Troca rápida de 1 clique entre Treinamento 16:9 e Reel 9:16 direto na lista
  const handleQuickToggleVideoType = async (art: Article) => {
    const currentIsReel =
      art.videoType === 'reel' ||
      (art.videoUrl?.includes('/shorts/') && art.videoType !== 'training');
    const nextType: 'reel' | 'training' = currentIsReel ? 'training' : 'reel';

    setTogglingVideoTypeId(art.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoType: nextType }),
      });

      const updated = await res.json();
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, videoType: nextType } : a))
        );
        setMessage({
          type: 'success',
          text:
            nextType === 'training'
              ? `"${art.title}" movido para Treinamentos (16:9).`
              : `"${art.title}" movido para Reels (9:16).`,
        });
        router.refresh();
      } else {
        setMessage({
          type: 'error',
          text: updated?.error || 'Erro ao alterar formato do vídeo.',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao alterar formato do vídeo.' });
    } finally {
      setTogglingVideoTypeId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    // Suporte a arquivos de até 50 MB via envio particionado inteligente (Chunked Upload)
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setMessage({
        type: 'error',
        text: `O arquivo possui ${fileSizeMb}MB e ultrapassa o limite máximo de ${MAX_SIZE_MB}MB. Para manuais acima de 50MB, utilize a opção "Adicionar Link (Nuvem / Drive)" logo abaixo!`,
      });
      setUploading(false);
      setUploadProgress(null);
      return;
    }

    try {
      const CHUNK_SIZE = 1.5 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const readBlobAsBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      let finalFileUrl = '';
      let finalFileName = file.name;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, (i + 1) * CHUNK_SIZE);
        const chunkBlob = file.slice(start, end);
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
          throw new Error(errData.error || `Erro ao enviar pedaço ${i + 1} de ${totalChunks}`);
        }

        const data = await res.json();
        const pct = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress(pct);

        if (data.completed && data.fileUrl) {
          finalFileUrl = data.fileUrl;
          finalFileName = data.fileName || file.name;
        }
      }

      if (finalFileUrl) {
        setAttachments((prev) => [...prev, { name: finalFileName, fileUrl: finalFileUrl }]);
        setMessage({
          type: 'success',
          text: `Arquivo "${finalFileName}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) anexado com sucesso!`,
        });
      } else {
        throw new Error('Falha ao concluir a montagem do arquivo no servidor.');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setMessage({ type: 'error', text: `Falha no upload do PDF: ${err?.message || 'Erro de conexão'}` });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAddLinkAttachment = () => {
    if (!linkDocUrl.trim()) {
      setMessage({ type: 'error', text: 'Informe a URL ou link do arquivo (ex: link do Google Drive, OneDrive ou link direto).' });
      return;
    }
    const name = linkDocName.trim() || 'Documento em PDF (Link)';
    setAttachments((prev) => [...prev, { name, fileUrl: linkDocUrl.trim() }]);
    setLinkDocName('');
    setLinkDocUrl('');
    setShowAddLinkDoc(false);
    setMessage({ type: 'success', text: `Link "${name}" adicionado com sucesso aos anexos!` });
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

    if ((materialKind === 'training_16_9' || materialKind === 'reel_9_16') && !videoUrl.trim()) {
      setMessage({
        type: 'error',
        text: 'Informe o link do vídeo do YouTube/Vimeo/Drive ou mude o tipo de material para "Manual / Regra / PDF".',
      });
      setSaving(false);
      return;
    }

    // Se o usuário estiver subindo um vídeo e deixou o conteúdo detalhado em branco, usa o resumo automaticamente
    const finalContent = content.trim() ? content : `<p>${summary.trim()}</p>`;
    const finalVideoType = videoUrl.trim()
      ? materialKind === 'reel_9_16'
        ? 'reel'
        : videoType
      : null;

    const payload = {
      title,
      summary,
      content: finalContent,
      videoUrl: videoUrl.trim() || null,
      videoType: finalVideoType,
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

      if (res.status === 413) {
        setMessage({
          type: 'error',
          text: 'O tamanho do material ou anexo antigo excede o limite de envio direto. Remova anexos antigos em Base64 e reenvie pelo botão "Enviar PDF do Computador" ou via Link do Drive.',
        });
        setSaving(false);
        return;
      }

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (res.ok && data) {
        const destinationLabel =
          finalVideoType === 'reel'
            ? 'em Reels (9:16)'
            : finalVideoType === 'training'
            ? 'em Treinamentos (16:9)'
            : 'no portal';

        // Update local articles state
        if (editingArticleId) {
          setArticles((prev) =>
            prev.map((a) => (a.id === editingArticleId ? { ...a, ...data } : a))
          );
        } else {
          setArticles((prev) => [data, ...prev]);
        }

        resetForm();
        setMessage({
          type: 'success',
          text: editingArticleId
            ? `Material atualizado com sucesso (${destinationLabel})!`
            : `Novo material publicado com sucesso ${destinationLabel}!`,
        });
        setActiveTab('list');
        router.refresh();
      } else {
        setMessage({
          type: 'error',
          text: data?.error || `Erro ao salvar material (Status ${res.status})`,
        });
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

  // Filtra artigos pela categoria, tipo e aplica busca inteligente multi-termos
  const categoryFiltered = articles.filter((art) => {
    const matchCategory =
      selectedCategoryFilter === 'all' || art.categoryId === selectedCategoryFilter;
    if (!matchCategory) return false;
    if (selectedTypeFilter === 'video') return Boolean(art.videoUrl);
    if (selectedTypeFilter === 'manual') return !art.videoUrl;
    if (selectedTypeFilter === 'pdf') return art.attachments && art.attachments.length > 0;
    return true;
  });
  const filteredArticles = searchTerm.trim()
    ? smartSearchArticles(categoryFiltered, searchTerm)
    : categoryFiltered;

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
              <span>Subir Novo Material / Vídeo</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'categories'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span>Categorias & Esteiras</span>
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
          onClick={() => setActiveTab('reels')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'reels'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>⚡ Pílulas & Reels (9:16)</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeTab === 'support'
              ? 'bg-[#25D366] text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Suporte WhatsApp</span>
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
                Materiais & Treinamentos Cadastrados ({articles.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visualize, edite ou alterne com 1 clique se um vídeo deve aparecer em <strong>Treinamento Completo (16:9)</strong> ou <strong>Reel (9:16)</strong>.
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
              <span>Subir Novo Material / Vídeo</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Pesquisa inteligente por 1 ou vários termos (título, resumo, PDF, categoria)..."
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

          {/* Filtro rápido por tipo (Videoaulas vs Manuais/Resumos vs PDFs) */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `Todos (${articles.length})` },
                {
                  id: 'video',
                  label: `📺 Videoaulas (${articles.filter((a) => Boolean(a.videoUrl)).length})`,
                },
                {
                  id: 'manual',
                  label: `📄 Manuais / Resumos (${articles.filter((a) => !a.videoUrl).length})`,
                },
                {
                  id: 'pdf',
                  label: `📎 Com PDFs (${articles.filter((a) => a.attachments.length > 0).length})`,
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedTypeFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                  selectedTypeFilter === opt.id
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
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
              {filteredArticles.map((art) => {
                const isReel =
                  art.videoType === 'reel' ||
                  (art.videoUrl?.includes('/shorts/') && art.videoType !== 'training');
                return (
                  <div
                    key={art.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                          {art.category?.name || 'Geral'}
                        </span>
                        {art.videoUrl ? (
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isReel
                                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <Video className="w-3 h-3" />
                            <span>
                              {isReel
                                ? '📱 Reel Vertical (9:16) • Topo'
                                : '📺 Treinamento Padrão (16:9) • Abaixo dos Reels'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                            📄 Manual / Regra
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

                    {/* Action Buttons: QUICK FORMAT TOGGLE, EDIT, VIEW, DELETE */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      {art.videoUrl && (
                        <button
                          type="button"
                          disabled={togglingVideoTypeId === art.id}
                          onClick={() => handleQuickToggleVideoType(art)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition flex items-center space-x-1.5 ${
                            isReel
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
                          }`}
                          title={
                            isReel
                              ? 'Converter para Treinamento (16:9)'
                              : 'Converter para Reel (9:16)'
                          }
                        >
                          {isReel ? (
                            <>
                              <MonitorPlay className="w-3.5 h-3.5" />
                              <span>
                                {togglingVideoTypeId === art.id
                                  ? 'Movendo...'
                                  : 'Mudar p/ Treinamento 16:9'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>
                                {togglingVideoTypeId === art.id
                                  ? 'Movendo...'
                                  : 'Mudar p/ Reel 9:16'}
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        href={`/artigos/${art.id}`}
                        target="_blank"
                        className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                        title="Ver no site"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver</span>
                      </Link>

                      <button
                        onClick={() => handleEditClick(art)}
                        className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(art.id, art.title)}
                        className="p-2 sm:px-3 sm:py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                        title="Excluir material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORMULÁRIO DE CRIAR / EDITAR MATERIAL COM SELETOR DE TIPO NO TOPO */}
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
                {editingArticleId ? `Editando: ${title || 'Material Selecionado'}` : 'Subir Novo Material / Treinamento'}
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
            {/* PASSO 1: TIPO DE MATERIAL */}
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Tipo de Material *</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Opção A: Treinamento Completo 16:9 */}
                <button
                  type="button"
                  onClick={() => handleSelectMaterialKind('training_16_9')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    materialKind === 'training_16_9'
                      ? 'border-rose-600 bg-rose-50/90 shadow-md ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                        <MonitorPlay className="w-4 h-4" />
                        <span>Vídeo 16:9</span>
                      </span>
                      {materialKind === 'training_16_9' && (
                        <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 pt-1">
                      Treinamento (16:9)
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Videoaula completa em tela horizontal.
                    </p>
                  </div>
                </button>

                {/* Opção B: Reel Vertical 9:16 */}
                <button
                  type="button"
                  onClick={() => handleSelectMaterialKind('reel_9_16')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    materialKind === 'reel_9_16'
                      ? 'border-cyan-600 bg-cyan-50/90 shadow-md ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded-lg">
                        <Smartphone className="w-4 h-4" />
                        <span>Vídeo 9:16</span>
                      </span>
                      {materialKind === 'reel_9_16' && (
                        <CheckCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 pt-1">
                      Reel / Pílula (9:16)
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Vídeo curto vertical (YouTube Shorts).
                    </p>
                  </div>
                </button>

                {/* Opção C: Resumo / Regra */}
                <button
                  type="button"
                  onClick={() => handleSelectMaterialKind('manual_pdf')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    materialKind === 'manual_pdf'
                      ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-800 bg-blue-100 px-2.5 py-1 rounded-lg">
                        <BookOpen className="w-4 h-4" />
                        <span>Texto</span>
                      </span>
                      {materialKind === 'manual_pdf' && (
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 pt-1">
                      Resumo / Regra
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Comunicado, regra bancária ou resumo operacional.
                    </p>
                  </div>
                </button>

                {/* Opção D: Material em PDF */}
                <button
                  type="button"
                  onClick={() => handleSelectMaterialKind('pdf_doc')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    materialKind === 'pdf_doc'
                      ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        <FileText className="w-4 h-4" />
                        <span>Arquivo PDF</span>
                      </span>
                      {materialKind === 'pdf_doc' && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 pt-1">
                      Material em PDF
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Manual completo em PDF para leitura e download por banco.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* PASSO 2: TÍTULO E CATEGORIA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  TÍTULO DO MATERIAL / TREINAMENTO *
                </label>
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
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  CATEGORIA DO SISTEMA *
                </label>
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
                RESUMO CURTO (Aparece no card de apresentação) *
              </label>
              <textarea
                rows={2}
                placeholder="Descreva brevemente as principais orientações, regras ou objetivos deste treinamento/material..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* VIDEO TRAINING INPUT & LIVE INLINE PREVIEW */}
            {(materialKind === 'training_16_9' ||
              materialKind === 'reel_9_16' ||
              videoUrl.trim().length > 0) && (
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                materialKind === 'reel_9_16'
                  ? 'bg-cyan-50/70 border-cyan-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Video className="w-4 h-4 text-rose-600" />
                  <span>
                    {materialKind === 'reel_9_16'
                      ? 'Link do Vídeo Vertical (9:16)'
                      : 'Link do Vídeo de Treinamento (16:9)'}
                  </span>
                </label>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    materialKind === 'reel_9_16'
                      ? 'text-cyan-800 bg-cyan-100 border border-cyan-300'
                      : 'text-rose-700 bg-rose-100 border border-rose-300'
                  }`}
                >
                  {materialKind === 'reel_9_16'
                    ? 'Reel (9:16)'
                    : 'Treinamento (16:9)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cole o link do YouTube (inclusive Não Listado), Vimeo, Loom ou Google Drive.
              </p>
              <input
                type="text"
                placeholder={
                  materialKind === 'reel_9_16'
                    ? 'ex: https://www.youtube.com/shorts/...'
                    : 'ex: https://www.youtube.com/watch?v=... ou https://youtu.be/...'
                }
                value={videoUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setVideoUrl(val);
                  if (val.trim() && (materialKind === 'manual_pdf' || materialKind === 'pdf_doc')) {
                    if (val.includes('/shorts/')) {
                      setMaterialKind('reel_9_16');
                      setVideoType('reel');
                    } else {
                      setMaterialKind('training_16_9');
                      setVideoType('training');
                    }
                  }
                }}
                className="w-full px-4 py-2.5 bg-white border border-rose-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              {videoUrl.trim() && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-black text-slate-900">Formato: </span>
                    {videoType === 'reel' ? (
                      <span className="font-bold text-cyan-700">Reel Vertical (9:16)</span>
                    ) : (
                      <span className="font-bold text-rose-700">Treinamento (16:9)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectMaterialKind('training_16_9')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                        videoType === 'training'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Treinamento 16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMaterialKind('reel_9_16')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                        videoType === 'reel'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Reel 9:16
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE PLAYER PREVIEW RIGHT INSIDE ADMIN */}
              {videoUrl.trim() && (
                <div className="pt-2">
                  <p className="text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Pré-visualização do Vídeo:</span>
                  </p>
                  <VideoPlayer
                    url={videoUrl}
                    title={title || 'Prévia do Vídeo de Treinamento'}
                    videoType={videoType}
                  />
                </div>
              )}
            </div>
            )}

            {/* RICH TEXT EDITOR SECTION */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>
                    CONTEÚDO DETALHADO & REGRAS{' '}
                    {videoUrl.trim() || materialKind === 'pdf_doc' ? '(Opcional)' : '*'}
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Formatação de texto, destaques e caixas de alerta.
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    PDFs & Materiais Anexos para Download
                  </h3>
                  <p className="text-xs text-slate-500">
                    Suba arquivos PDF de até 50MB direto no sistema ou adicione links do Google Drive / Nuvem.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className={`cursor-pointer inline-flex items-center space-x-2 font-extrabold px-3.5 py-2 rounded-xl text-xs transition shadow-sm ${
                    uploading ? 'bg-blue-500 text-white cursor-wait' : 'bg-blue-700 hover:bg-blue-800 text-white'
                  }`}>
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploading
                        ? uploadProgress !== null
                          ? `Enviando PDF (${uploadProgress}%)...`
                          : 'Processando...'
                        : 'Subir Arquivo PDF (até 50MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddLinkDoc(!showAddLinkDoc)}
                    className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs border border-slate-300 transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Adicionar Link (Nuvem / Drive)</span>
                  </button>
                </div>
              </div>

              {/* Barra de Progresso em Tempo Real */}
              {uploading && uploadProgress !== null && (
                <div className="space-y-1.5 bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex justify-between text-xs font-bold text-blue-900">
                    <span>Progresso do Upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Form para adicionar Link de Documento */}
              {showAddLinkDoc && (
                <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3 animate-in fade-in">
                  <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Anexar Material por Link (Google Drive, OneDrive ou Link Direto)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Nome de Exibição do Arquivo:
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Manual Operacional 2026 Caixa.pdf"
                        value={linkDocName}
                        onChange={(e) => setLinkDocName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        URL do Arquivo (Link de compartilhamento):
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... ou https://..."
                        value={linkDocUrl}
                        onChange={(e) => setLinkDocUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLinkDoc(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLinkAttachment}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg transition"
                    >
                      + Anexar Link
                    </button>
                  </div>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">{att.name}</span>
                        {att.fileUrl?.startsWith('data:') ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-200">
                            Arquivo Direto
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0 border border-blue-200">
                            Link Externo
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold shrink-0"
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
                  : materialKind === 'training_16_9'
                  ? 'Publicar Treinamento (16:9)'
                  : materialKind === 'reel_9_16'
                  ? 'Publicar Reel (9:16)'
                  : materialKind === 'pdf_doc'
                  ? 'Publicar Material em PDF'
                  : 'Publicar Resumo / Regra'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CATEGORIAS */}
      {activeTab === 'categories' && (
        <AdminCategoriesManager
          categories={categories}
          onCategoriesChanged={fetchFreshCategories}
        />
      )}

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
                    placeholder="ex: Regras & Manuais 2025/2026"
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
                        placeholder="ex: Treinamento Oficial 2026"
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

      {/* TAB: GERENCIADOR DE REELS / PÍLULAS RÁPIDAS */}
      {activeTab === 'reels' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Gestão de Vídeos Verticais (9:16)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Pílulas Rápidas & Feed de Reels (Treinamentos)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Gerencie os vídeos curtos verticais (9:16) que aparecem no canto superior da aba &quot;Treinamentos e Videoaulas&quot;.
              </p>
            </div>
          </div>

          <AdminReelsManager
            onConvertedToArticle={(newArticle) => {
              setArticles((prev) => [newArticle, ...prev]);
              router.refresh();
            }}
          />
        </div>
      )}

      {/* TAB: CONFIGURAÇÃO DO WHATSAPP DE SUPORTE */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Atendimento & Apoio Matriz</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Configuração do Botão WhatsApp de Suporte
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Altere o número de telefone e a mensagem que aparecem no botão flutuante em todas as páginas do site.
              </p>
            </div>

            {/* Teste Imediato */}
            {supportPhone && (
              <a
                href={`https://wa.me/${supportPhone.replace(/\D/g, '').startsWith('55') ? supportPhone.replace(/\D/g, '') : `55${supportPhone.replace(/\D/g, '')}`}?text=${encodeURIComponent(supportMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold px-3.5 py-2 rounded-xl text-xs transition shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar Conversa no WhatsApp</span>
              </a>
            )}
          </div>

          {supportFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                supportFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {supportFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{supportFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSupport} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Número do WhatsApp de Suporte *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 17997750058 ou 5517997750058"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Digite com DDD (ex: 17997750058). O código 55 do Brasil será formatado automaticamente.
                </span>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Link de Abertura de Ticket / Chamado (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="Ex: https://suporte.cotafacil.com.br/abrir-chamado"
                  value={supportHelpDeskUrl}
                  onChange={(e) => setSupportHelpDeskUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Se preenchido, exibirá um botão secundário &quot;Abrir Chamado / Ticket&quot; no card flutuante.
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Mensagem Padrão Inicial
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Olá! Estou consultando o Hub de Apoio Operacional CotaFácil e gostaria de tirar uma dúvida sobre uma esteira de crédito imobiliário."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Texto que já virá digitado quando o franqueado clicar em &quot;Iniciar Conversa no WhatsApp&quot;.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSupport}
                className="px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>{savingSupport ? 'Salvando...' : 'Salvar Configurações de Suporte'}</span>
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
