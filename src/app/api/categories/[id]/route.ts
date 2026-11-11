import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, slug, description, icon } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verifica se já existe outra categoria com esse mesmo slug
    const existing = await prisma.category.findFirst({
      where: {
        slug: finalSlug,
        NOT: { id: params.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Já existe outra categoria com o identificador "${finalSlug}". Escolha outro slug.` },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conta se existem materiais vinculados
    const count = await prisma.article.count({
      where: { categoryId: params.id },
    });

    if (count > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir esta categoria porque existem ${count} material(is) vinculado(s) a ela. Mova os materiais para outra categoria antes.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    invalidateCache('categories');
    invalidateCache('articles');
    revalidatePath('/');
    revalidatePath('/categorias/materiais-pdf');
    revalidatePath('/categorias/[slug]', 'page');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao excluir categoria' },
      { status: 500 }
    );
  }
}
