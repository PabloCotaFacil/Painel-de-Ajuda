import { prisma } from './prisma';

export interface ShortReelItem {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  categoryTag?: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const DEFAULT_SHORT_REELS: ShortReelItem[] = [
  {
    id: 'default-reel-1',
    title: 'Regra de LTV no Financiamento Caixa: Evite Reprovações',
    description: 'Dica rápida de 50 segundos explicando como compor a renda para atingir a cota máxima de 80% no SBPE.',
    videoUrl: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
    categoryTag: 'Crédito Imobiliário • Caixa',
    order: 1,
    isActive: true,
  },
  {
    id: 'default-reel-2',
    title: 'Matrícula do Imóvel: Ônus e Ações com menos de 30 dias',
    description: 'A certidão com prazo vencido é a principal causa de pendência na esteira bancária. Veja como conferir.',
    videoUrl: 'https://www.youtube.com/shorts/5qap5aO4i9A',
    categoryTag: 'Documentação & Cartório',
    order: 2,
    isActive: true,
  },
  {
    id: 'default-reel-3',
    title: 'Comprovação de Renda: Extrato Bancário x IRPF',
    description: 'Diferenças práticas de aceitação entre Caixa, Itaú e Santander para clientes PJ e autônomos.',
    videoUrl: 'https://www.youtube.com/shorts/3JZ_D3ELwOQ',
    categoryTag: 'Análise de Risco & Bancos',
    order: 3,
    isActive: true,
  },
];

let isTableVerified = false;

async function ensureShortReelTable() {
  if (isTableVerified) return;
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ShortReel" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "videoUrl" TEXT NOT NULL,
        "categoryTag" TEXT DEFAULT 'Treinamento Rápido',
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isTableVerified = true;
  } catch (err) {
    // Se falhar (ex: restrição ou SQLite), ignora silenciosamente
    console.warn('Verificação de tabela ShortReel:', err);
  }
}

export async function getActiveShortReels(): Promise<ShortReelItem[]> {
  try {
    await ensureShortReelTable();

    const reels = await (prisma as any).shortReel.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    if (reels && reels.length > 0) {
      return reels;
    }

    return DEFAULT_SHORT_REELS;
  } catch (error) {
    console.error('Erro ao buscar reels no banco:', error);
    return DEFAULT_SHORT_REELS;
  }
}

export async function getAllShortReels(): Promise<ShortReelItem[]> {
  try {
    await ensureShortReelTable();

    const reels = await (prisma as any).shortReel.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    if (reels && reels.length > 0) {
      return reels;
    }

    return DEFAULT_SHORT_REELS;
  } catch (error) {
    console.error('Erro ao buscar todos os reels:', error);
    return DEFAULT_SHORT_REELS;
  }
}
