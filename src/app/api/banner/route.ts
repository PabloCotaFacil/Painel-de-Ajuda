import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

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
          title: 'Hub de apoio Imobiliário, Crédito PJ & Agro',
          subtitle: 'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.',
          primaryButtonText: 'Ver Regras & Manuais',
          primaryButtonUrl: '/categorias/treinamentos',
          secondaryButtonText: 'Área do Gestor',
          secondaryButtonUrl: '/admin/login',
        },
      });
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
    } = body;

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
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar banner' }, { status: 500 });
  }
}
