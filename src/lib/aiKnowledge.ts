import { prisma } from './prisma';
import { getCached, setCached } from './cache';

const REMOVED_CATEGORY_SLUGS = ['credito-pj', 'credito-agro'];

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  plainContent: string;
  videoUrl: string | null;
  categoryName: string;
  categorySlug: string;
  attachments: Array<{
    id: string;
    name: string;
    fileUrl: string;
  }>;
}

export interface KnowledgeBaseSnapshot {
  articles: KnowledgeArticle[];
  reels: Array<{
    id: string;
    title: string;
    description: string | null;
    categoryTag: string | null;
    videoUrl: string;
  }>;
}

export interface ScoredSource {
  index: number;
  id: string;
  title: string;
  summary: string;
  plainContent: string;
  categoryName: string;
  categorySlug: string;
  hasPdf: boolean;
  url: string;
  score: number;
  attachments: Array<{
    id: string;
    name: string;
    fileUrl: string;
  }>;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const STOP_WORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'com', 'sem', 'sob', 'sobre', 'entre',
  'que', 'qual', 'quais', 'como', 'onde', 'quando', 'porque',
  'e', 'ou', 'mas', 'se', 'nao', 'sim', 'ter', 'tem', 'pode', 'posso',
  'fazer', 'funciona', 'sobre', 'esse', 'essa', 'isso', 'este', 'esta',
  'me', 'te', 'ele', 'ela', 'eu', 'voce', 'nos', 'eles', 'meu', 'minha',
]);

export async function getKnowledgeSnapshot(): Promise<KnowledgeBaseSnapshot> {
  const cached = getCached<KnowledgeBaseSnapshot>('ai:knowledge-snapshot', 60000);
  if (cached) return cached;

  const [rawArticles, rawReels] = await Promise.all([
    prisma.article.findMany({
      where: {
        category: {
          slug: { notIn: REMOVED_CATEGORY_SLUGS },
        },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        videoUrl: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
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
    prisma.shortReel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        categoryTag: true,
        videoUrl: true,
      },
      orderBy: { order: 'asc' },
    }),
  ]);

  const snapshot: KnowledgeBaseSnapshot = {
    articles: rawArticles.map((art) => ({
      id: art.id,
      title: art.title,
      summary: art.summary,
      plainContent: stripHtml(art.content).slice(0, 8000),
      videoUrl: art.videoUrl,
      categoryName: art.category?.name || 'Geral',
      categorySlug: art.category?.slug || 'imobiliario',
      attachments: art.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        // Evita carregar data URI gigante em memória de cache; mantém apenas referência/URL curta
        fileUrl: att.fileUrl.startsWith('data:') ? 'data-uri-inline' : att.fileUrl,
      })),
    })),
    reels: rawReels,
  };

  setCached('ai:knowledge-snapshot', snapshot);
  return snapshot;
}

export function retrieveRelevantSources(
  snapshot: KnowledgeBaseSnapshot,
  question: string,
  maxSources = 8
): ScoredSource[] {
  const qNorm = normalize(question);
  const tokens = qNorm
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  const scored = snapshot.articles.map((art) => {
    const titleNorm = normalize(art.title);
    const catNorm = normalize(art.categoryName);
    const sumNorm = normalize(art.summary);
    const contentNorm = normalize(art.plainContent);
    const attNorm = normalize(art.attachments.map((a) => a.name).join(' '));

    let score = 0;

    if (qNorm.length >= 4) {
      if (titleNorm.includes(qNorm)) score += 25;
      if (sumNorm.includes(qNorm)) score += 15;
      if (contentNorm.includes(qNorm)) score += 10;
    }

    for (const token of tokens) {
      if (titleNorm.includes(token)) score += 8;
      if (catNorm.includes(token)) score += 6;
      if (attNorm.includes(token)) score += 6;
      if (sumNorm.includes(token)) score += 4;
      if (contentNorm.includes(token)) score += 2;
    }

    return {
      art,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const matched = scored.filter((s) => s.score > 0).slice(0, maxSources);
  const selected =
    matched.length > 0 ? matched : scored.slice(0, Math.min(5, scored.length));

  return selected.map((item, idx) => ({
    index: idx + 1,
    id: item.art.id,
    title: item.art.title,
    summary: item.art.summary,
    plainContent: item.art.plainContent,
    categoryName: item.art.categoryName,
    categorySlug: item.art.categorySlug,
    hasPdf: item.art.attachments.length > 0,
    url: `/artigos/${item.art.id}`,
    score: item.score,
    attachments: item.art.attachments,
  }));
}

/**
 * Extrai as frases/linhas mais relevantes de um texto para a pergunta informada.
 */
export function extractRelevantSentences(
  text: string,
  question: string,
  maxSentences = 3
): string[] {
  if (!text) return [];
  const qNorm = normalize(question);
  const tokens = qNorm
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  const chunks = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((c) => c.trim())
    .filter((c) => c.length >= 15);

  if (chunks.length === 0) return [];

  const scored = chunks.map((chunk, idx) => {
    const cNorm = normalize(chunk);
    let score = 0;
    for (const token of tokens) {
      if (cNorm.includes(token)) score += 3;
    }
    if (/%|r\$|taxa|juros|prazo|renda|fgts|entrada|valor|banco/i.test(chunk)) {
      score += 1;
    }
    return { chunk, score, idx };
  });

  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  const best = scored.filter((s) => s.score > 0).slice(0, maxSentences);
  return best.map((b) => b.chunk);
}

/**
 * Busca até 3 PDFs em StoredFile ou Attachment inline ligados às fontes mais relevantes (máx 4MB cada)
 * para envio multimodal nativo ao Gemini (leitura real de PDFs estilo NotebookLM).
 */
export async function loadInlinePdfsForSources(
  sources: ScoredSource[]
): Promise<Array<{ name: string; sourceIndex: number; base64Data: string; mimeType: string }>> {
  const fileCandidates: Array<{ fileId: string; name: string; sourceIndex: number }> = [];
  const inlineCandidates: Array<{ attachmentId: string; name: string; sourceIndex: number }> = [];

  for (const src of sources) {
    for (const att of src.attachments) {
      if (att.fileUrl.startsWith('/api/files/')) {
        const fileId = att.fileUrl.replace('/api/files/', '').split('?')[0].trim();
        if (fileId) {
          fileCandidates.push({ fileId, name: att.name, sourceIndex: src.index });
        }
      } else if (att.fileUrl === 'data-uri-inline') {
        inlineCandidates.push({ attachmentId: att.id, name: att.name, sourceIndex: src.index });
      }
      if (fileCandidates.length + inlineCandidates.length >= 3) break;
    }
    if (fileCandidates.length + inlineCandidates.length >= 3) break;
  }

  if (fileCandidates.length === 0 && inlineCandidates.length === 0) return [];

  try {
    const results: Array<{
      name: string;
      sourceIndex: number;
      base64Data: string;
      mimeType: string;
    }> = [];

    if (fileCandidates.length > 0) {
      const files = await prisma.storedFile.findMany({
        where: {
          id: { in: fileCandidates.map((c) => c.fileId) },
          size: { lte: 4 * 1024 * 1024 },
        },
        select: {
          id: true,
          name: true,
          mimeType: true,
          data: true,
        },
      });

      for (const f of files) {
        const cand = fileCandidates.find((c) => c.fileId === f.id);
        if (!cand || !f.data) continue;
        results.push({
          name: f.name,
          sourceIndex: cand.sourceIndex,
          base64Data: f.data,
          mimeType: f.mimeType || 'application/pdf',
        });
      }
    }

    if (inlineCandidates.length > 0) {
      const atts = await prisma.attachment.findMany({
        where: { id: { in: inlineCandidates.map((c) => c.attachmentId) } },
        select: { id: true, name: true, fileUrl: true },
      });

      for (const a of atts) {
        const cand = inlineCandidates.find((c) => c.attachmentId === a.id);
        if (!cand || !a.fileUrl.startsWith('data:')) continue;
        const commaIdx = a.fileUrl.indexOf(',');
        if (commaIdx === -1) continue;
        const header = a.fileUrl.slice(5, commaIdx);
        const mimeType = header.split(';')[0] || 'application/pdf';
        const base64Data = a.fileUrl.slice(commaIdx + 1);
        if (base64Data.length > 5.5 * 1024 * 1024) continue;
        results.push({
          name: a.name,
          sourceIndex: cand.sourceIndex,
          base64Data,
          mimeType,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Erro ao carregar PDFs para contexto IA:', error);
    return [];
  }
}
