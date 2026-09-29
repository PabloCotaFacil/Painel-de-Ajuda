import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, summary, content, categoryId, attachments } = body;

    if (!title || !summary || !content || !categoryId) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        summary,
        content,
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

    return NextResponse.json(article);
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: 'Erro ao criar artigo' }, { status: 500 });
  }
}
