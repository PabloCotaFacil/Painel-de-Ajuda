import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, videoUrl, categoryTag, order, isActive } = body;

    const updated = await (prisma as any).shortReel.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(videoUrl && { videoUrl: videoUrl.trim() }),
        ...(categoryTag !== undefined && { categoryTag: categoryTag ? categoryTag.trim() : null }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
    });

    revalidatePath('/categorias/treinamentos');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar reel:', error);
    return NextResponse.json({ error: 'Erro ao atualizar reel' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    await (prisma as any).shortReel.delete({
      where: { id: params.id },
    });

    revalidatePath('/categorias/treinamentos');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar reel:', error);
    return NextResponse.json({ error: 'Erro ao deletar reel' }, { status: 500 });
  }
}
