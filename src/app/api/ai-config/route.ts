import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function maskApiKey(key: string): string {
  if (!key || key.length < 10) return '';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export async function GET() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const [providerCfg, keyCfg] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { key: 'ai_provider' } }),
      prisma.systemConfig.findUnique({ where: { key: 'ai_api_key' } }),
    ]);

    const envGemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    const envOpenai = process.env.OPENAI_API_KEY || '';

    const activeKey = keyCfg?.value || envGemini || envOpenai || '';
    const activeProvider =
      (providerCfg?.value as 'gemini' | 'openai') ||
      (envOpenai && !envGemini ? 'openai' : 'gemini');

    return NextResponse.json({
      provider: activeProvider,
      hasKey: Boolean(activeKey),
      maskedKey: maskApiKey(activeKey),
      source: keyCfg?.value ? 'admin' : activeKey ? 'env' : 'none',
    });
  } catch (error) {
    console.error('Erro ao ler configuração de IA:', error);
    return NextResponse.json({ error: 'Erro ao carregar configuração' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { provider, apiKey } = await request.json();
    const cleanProvider = provider === 'openai' ? 'openai' : 'gemini';
    const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';

    await prisma.systemConfig.upsert({
      where: { key: 'ai_provider' },
      update: { value: cleanProvider },
      create: { key: 'ai_provider', value: cleanProvider },
    });

    if (cleanKey) {
      await prisma.systemConfig.upsert({
        where: { key: 'ai_api_key' },
        update: { value: cleanKey },
        create: { key: 'ai_api_key', value: cleanKey },
      });
    } else if (apiKey === '') {
      // Permite limpar a chave manualmente
      await prisma.systemConfig.deleteMany({
        where: { key: 'ai_api_key' },
      });
    }

    return NextResponse.json({
      success: true,
      provider: cleanProvider,
      hasKey: Boolean(cleanKey),
      maskedKey: maskApiKey(cleanKey),
    });
  } catch (error) {
    console.error('Erro ao salvar configuração de IA:', error);
    return NextResponse.json({ error: 'Erro ao salvar configuração de IA' }, { status: 500 });
  }
}
