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
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      badgeText,
      title,
      subtitle,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      mediaType,
      videoUrl,
      videoTitle,
      cardsJson,
    } = body;

    const formattedCardsJson =
      typeof cardsJson === 'string'
        ? cardsJson
        : JSON.stringify(cardsJson || []);

    const banner = await prisma.heroBanner.upsert({
      where: { id: 'default-hero' },
      update: {
        badgeText,
        title,
        subtitle,
        primaryButtonText,
        primaryButtonUrl,
        secondaryButtonText,
        secondaryButtonUrl,
        mediaType: mediaType || 'cards',
        videoUrl: videoUrl || '',
        videoTitle: videoTitle || '',
        cardsJson: formattedCardsJson,
      },
      create: {
        id: 'default-hero',
        badgeText,
        title,
        subtitle,
        primaryButtonText,
        primaryButtonUrl,
        secondaryButtonText,
        secondaryButtonUrl,
        mediaType: mediaType || 'cards',
        videoUrl: videoUrl || '',
        videoTitle: videoTitle || '',
        cardsJson: formattedCardsJson,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar banner' }, { status: 500 });
  }
}
