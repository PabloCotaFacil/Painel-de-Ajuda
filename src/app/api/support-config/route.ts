import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_WHATSAPP = '5517997750058';
const DEFAULT_MESSAGE =
  'Olá! Estou consultando o Hub de Apoio Operacional CotaFácil e gostaria de tirar uma dúvida sobre uma esteira de crédito imobiliário.';

export async function GET() {
  try {
    const [numConfig, msgConfig, urlConfig] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { key: 'support_whatsapp_number' } }),
      prisma.systemConfig.findUnique({ where: { key: 'support_default_message' } }),
      prisma.systemConfig.findUnique({ where: { key: 'support_helpdesk_url' } }),
    ]);

    return NextResponse.json({
      whatsappNumber: numConfig?.value || DEFAULT_WHATSAPP,
      defaultMessage: msgConfig?.value || DEFAULT_MESSAGE,
      helpDeskUrl: urlConfig?.value || '',
    });
  } catch (error) {
    console.error('Erro ao buscar configuração de suporte:', error);
    return NextResponse.json({
      whatsappNumber: DEFAULT_WHATSAPP,
      defaultMessage: DEFAULT_MESSAGE,
      helpDeskUrl: '',
    });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { whatsappNumber, defaultMessage, helpDeskUrl } = await request.json();

    if (!whatsappNumber || !whatsappNumber.trim()) {
      return NextResponse.json({ error: 'Número do WhatsApp é obrigatório' }, { status: 400 });
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      return NextResponse.json(
        { error: 'Informe um número de WhatsApp válido com DDD (mínimo 10 dígitos).' },
        { status: 400 }
      );
    }

    // Salva ou atualiza as configurações
    await Promise.all([
      prisma.systemConfig.upsert({
        where: { key: 'support_whatsapp_number' },
        update: { value: cleanNumber },
        create: { key: 'support_whatsapp_number', value: cleanNumber },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'support_default_message' },
        update: { value: defaultMessage ? defaultMessage.trim() : DEFAULT_MESSAGE },
        create: { key: 'support_default_message', value: defaultMessage ? defaultMessage.trim() : DEFAULT_MESSAGE },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'support_helpdesk_url' },
        update: { value: helpDeskUrl ? helpDeskUrl.trim() : '' },
        create: { key: 'support_helpdesk_url', value: helpDeskUrl ? helpDeskUrl.trim() : '' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      whatsappNumber: cleanNumber,
      defaultMessage: defaultMessage?.trim() || DEFAULT_MESSAGE,
      helpDeskUrl: helpDeskUrl?.trim() || '',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar suporte:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao salvar configuração de suporte' },
      { status: 500 }
    );
  }
}
