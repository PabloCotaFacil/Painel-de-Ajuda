import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveShortReels } from '@/lib/reels';
import { smartSearchArticles, smartSearchReels } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json({ articles: [], reels: [] });
    }

    const allArticles = await prisma.article.findMany({
      where: {
        category: {
          slug: {
            notIn: ['credito-pj', 'credito-agro'],
          },
        },
      },
      include: {
        category: true,
        attachments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const matchedArticles = smartSearchArticles(allArticles, q).slice(0, 8).map((art) => ({
      id: art.id,
      title: art.title,
      summary: art.summary,
      videoUrl: art.videoUrl,
      videoType: (art as any).videoType || 'training',
      categoryName: art.category?.name || 'Geral',
      categorySlug: art.category?.slug || 'all',
      attachmentsCount: art.attachments?.length || 0,
      firstAttachmentName: art.attachments?.[0]?.name || null,
    }));

    const activeReels = await getActiveShortReels();
    const matchedReels = smartSearchReels(activeReels, q).slice(0, 4).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      categoryTag: r.categoryTag,
      videoUrl: r.videoUrl,
    }));

    return NextResponse.json({
      articles: matchedArticles,
      reels: matchedReels,
    });
  } catch (error) {
    console.error('Erro na API de busca inteligente:', error);
    return NextResponse.json({ articles: [], reels: [] }, { status: 500 });
  }
}
