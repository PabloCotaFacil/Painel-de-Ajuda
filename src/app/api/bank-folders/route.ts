import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { checkIsAdmin } from '@/lib/auth';
import { getBankFolders, saveBankFolders } from '@/lib/bankFolders';

export async function GET() {
  try {
    const folders = await getBankFolders();
    return NextResponse.json(folders, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar pastas dos bancos:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar pastas dos bancos' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawFolders = Array.isArray(body) ? body : body?.folders;

    if (!Array.isArray(rawFolders)) {
      return NextResponse.json(
        { error: 'Formato inválido para pastas dos bancos' },
        { status: 400 }
      );
    }

    const saved = await saveBankFolders(rawFolders);

    revalidatePath('/');
    revalidatePath('/bancos');
    revalidatePath('/categorias/imobiliario');
    revalidatePath('/categorias/[slug]', 'page');

    return NextResponse.json({ success: true, folders: saved });
  } catch (error) {
    console.error('Erro ao salvar pastas dos bancos:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar configuração de pastas dos bancos' },
      { status: 500 }
    );
  }
}
