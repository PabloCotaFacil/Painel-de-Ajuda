import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrSeedCategories } from '@/lib/categories';
import { checkIsAdmin } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const categories = await getOrSeedCategories();
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, slug, description, icon } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verifica se já existe categoria com esse slug
    const existing = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Já existe uma categoria cadastrada com o slug "${finalSlug}". Escolha outro nome ou slug.` },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description ? description.trim() : null,
        icon: icon || 'folder',
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    invalidateCache('categories');
    invalidateCache('articles');
    revalidatePath('/');
    revalidatePath('/categorias/materiais-pdf');
    revalidatePath('/categorias/[slug]', 'page');

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao criar categoria' }, { status: 500 });
  }
}
