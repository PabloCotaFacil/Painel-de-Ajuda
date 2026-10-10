import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

const defaultCards = JSON.stringify([
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

export async function GET() {
  try {
    let banner = await prisma.heroBanner.findUnique({
      where: { id: 'default-hero' },
    });

    if (!banner) {
      banner = await prisma.heroBanner.create({
        data: {
          id: 'default-hero',
          badgeText: 'Regras & Manuais Safra 2025/2026',
          title: 'Como podemos te ajudar?',
          subtitle: 'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.',
          primaryButtonText: 'Ver Regras & Manuais',
          primaryButtonUrl: '/categorias/treinamentos',
          secondaryButtonText: '',
          secondaryButtonUrl: '',
          mediaType: 'cards',
          videoUrl: '',
          videoTitle: '',
          cardsJson: defaultCards,
        },
      });
    }

    if (!banner.cardsJson || banner.cardsJson === '[]') {
      banner = {
        ...banner,
        cardsJson: defaultCards,
      };
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar banner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Sessão expirada ou não autorizada. Faça login novamente no painel.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      badgeText = '',
      title = '',
      subtitle = '',
      primaryButtonText = '',
      primaryButtonUrl = '',
      secondaryButtonText = '',
      secondaryButtonUrl = '',
      mediaType = 'cards',
      videoUrl = '',
      videoTitle = '',
      cardsJson,
    } = body;

    let formattedCardsJson = defaultCards;
    if (typeof cardsJson === 'string' && cardsJson.trim().length > 0) {
      formattedCardsJson = cardsJson;
    } else if (Array.isArray(cardsJson)) {
      formattedCardsJson = JSON.stringify(cardsJson);
    }

    const safeData = {
      badgeText: String(badgeText ?? 'Regras & Manuais Safra 2025/2026'),
      title: String(title ?? 'Como podemos te ajudar?'),
      subtitle: String(subtitle ?? ''),
      primaryButtonText: String(primaryButtonText ?? 'Ver Regras & Manuais'),
      primaryButtonUrl: String(primaryButtonUrl ?? '/categorias/treinamentos'),
      secondaryButtonText: String(secondaryButtonText ?? ''),
      secondaryButtonUrl: String(secondaryButtonUrl ?? ''),
      mediaType: mediaType === 'video' ? 'video' : 'cards',
      videoUrl: String(videoUrl ?? '').trim(),
      videoTitle: String(videoTitle ?? '').trim(),
      cardsJson: formattedCardsJson,
    };

    const banner = await prisma.heroBanner.upsert({
      where: { id: 'default-hero' },
      update: safeData,
      create: {
        id: 'default-hero',
        ...safeData,
      },
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Erro ao atualizar banner:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao atualizar banner no banco de dados' },
      { status: 500 }
    );
  }
}
