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
    const { title, summary, content, categoryId, attachments, videoUrl } = body;

    // Remove old attachments
    await prisma.attachment.deleteMany({ where: { articleId: params.id } });

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        summary,
        content,
        videoUrl: videoUrl ? videoUrl.trim() : null,
        categoryId,
        attachments: {
          create: attachments?.map((att: { name: string; fileUrl: string }) => ({
            name: att.name,
            fileUrl: att.fileUrl,
            fileType: 'pdf',
          })),
        },
      },
      include: { attachments: true },
    });

    revalidatePath('/');
    revalidatePath(`/artigos/${params.id}`);
    revalidatePath('/categorias/[slug]', 'page');

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar artigo' }, { status: 500 });
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
    await prisma.article.delete({ where: { id: params.id } });
    revalidatePath('/');
    revalidatePath('/categorias/[slug]', 'page');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar artigo' }, { status: 500 });
  }
}
