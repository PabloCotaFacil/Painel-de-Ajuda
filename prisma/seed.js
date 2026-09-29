const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Imob Giro e Agro...');

  // Clean existing tables
  await prisma.attachment.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.triggerTier.deleteMany({});
  await prisma.institutionProduct.deleteMany({});
  await prisma.heroBanner.deleteMany({});

  // 1. Create Default Hero Banner (Editable by Admin)
  await prisma.heroBanner.create({
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

  // 2. Create Categories
  const catImob = await prisma.category.create({
    data: {
      name: 'Crédito Imobiliário',
      slug: 'imobiliario',
      description: 'Financiamento habitacional, Home Equity e repasse bancário.',
      icon: 'home',
    },
  });

  const catPJ = await prisma.category.create({
    data: {
      name: 'Crédito PJ',
      slug: 'credito-pj',
      description: 'Capital de Giro, Antecipação, FGO e Linhas de Garantia.',
      icon: 'building',
    },
  });

  const catAgro = await prisma.category.create({
    data: {
      name: 'Crédito Agro',
      slug: 'credito-agro',
      description: 'Custeio, Investimento, CPR, Moderfrota e Pronaf.',
      icon: 'sprout',
    },
  });

  const catTreinamento = await prisma.category.create({
    data: {
      name: 'Regras & Treinamentos',
      slug: 'treinamentos',
      description: 'Manuais de produto, resumos operacionais e regras de esteira.',
      icon: 'book',
    },
  });

  // 3. Create Articles & Attachments
  await prisma.article.create({
    data: {
      title: 'Regras de Financiamento Habitação Caixa - LTV & Documentação',
      summary: 'Confira as tabelas atualizadas de LTV máximo (SBPE e Minha Casa Minha Vida) e lista completa de certidões necessárias.',
      content: `### Resumo da Operação
- **Financiamento SBPE**: Até 80% de LTV no sistema SAC e 70% no PRICE.
- **Taxas de Juros**: A partir de 9.99% a.a. + TR.
- **Documentos Obrigatórios**: RG/CPF, Comprovante de Renda (3 últimos holerites ou IR), Matrícula Atualizada do Imóvel (com certidão de ônus e ações).

### Regra Importante
Operações com LTV acima de 75% exigem análise prévia do comitê de crédito habitacional.`,
      categoryId: catImob.id,
      attachments: {
        create: [
          {
            name: 'Manual_Operacional_Caixa_Habitacao_2026.pdf',
            fileUrl: '/uploads/manual_caixa_2026.pdf',
            fileType: 'pdf',
          },
        ],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Capital de Giro PJ com Garantia FGO & Pronampe',
      summary: 'Passo a passo para enquadramento de empresas no FGO, limites de faturamento e taxas bonificadas.',
      content: `### Linha de Crédito PJ FGO
- **Faturamento Elegível**: Empresas de Médio e Pequeno Porte (até R$ 300 milhões).
- **Garantia**: Cobertura de até 80% do fundo FGO.
- **Prazos**: Até 60 meses com carência de até 12 meses.`,
      categoryId: catPJ.id,
      attachments: {
        create: [
          {
            name: 'Guia_FGO_Pronampe_Credito_PJ.pdf',
            fileUrl: '/uploads/guia_fgo_pj.pdf',
            fileType: 'pdf',
          },
        ],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Crédito Agro: Linha Custeio & CPR Física e Jurídica',
      summary: 'Regras de enquadramento para produtores rurais, garantias reais e taxas da safra 2025/2026.',
      content: `### Custeio Agrícola e Pecuário
- **Culturas Aceitas**: Soja, Milho, Algodão, Pecuária de Corte e Leite.
- **Instrumentos**: CPR (Cédula de Produto Rural) Registrada em B3 / Vetor.
- **Documentos Exigidos**: CAR (Cadastro Ambiental Rural), Matrícula da Propriedade e Laudo de Vistoria Agronômica.`,
      categoryId: catAgro.id,
      attachments: {
        create: [
          {
            name: 'Resumo_Regras_CPR_Agro_Safra.pdf',
            fileUrl: '/uploads/resumo_cpr_agro.pdf',
            fileType: 'pdf',
          },
        ],
      },
    },
  });

  // 4. Create Institution Products & Production Trigger Tiers (Restricted to Gestores)
  const itauImob = await prisma.institutionProduct.create({
    data: {
      bankName: 'Itaú Imobiliário',
      segment: 'Crédito Imobiliário',
      description: 'Financiamento residencial e comercial SBPE com gatilhos por volume mensal para Gestores.',
    },
  });

  await prisma.triggerTier.createMany({
    data: [
      {
        institutionProductId: itauImob.id,
        minVolume: 0,
        maxVolume: 499999.99,
        commissionRate: 1.2,
      },
      {
        institutionProductId: itauImob.id,
        minVolume: 500000,
        maxVolume: 999999.99,
        commissionRate: 1.5,
      },
      {
        institutionProductId: itauImob.id,
        minVolume: 1000000,
        maxVolume: null,
        commissionRate: 2.0,
      },
    ],
  });

  const bbAgro = await prisma.institutionProduct.create({
    data: {
      bankName: 'Banco do Brasil Agro',
      segment: 'Crédito Agro',
      description: 'Custeio e Investimento Agrícola com bonificação por produção.',
    },
  });

  await prisma.triggerTier.createMany({
    data: [
      {
        institutionProductId: bbAgro.id,
        minVolume: 0,
        maxVolume: 999999.99,
        commissionRate: 1.0,
      },
      {
        institutionProductId: bbAgro.id,
        minVolume: 1000000,
        maxVolume: 2999999.99,
        commissionRate: 1.4,
      },
      {
        institutionProductId: bbAgro.id,
        minVolume: 3000000,
        maxVolume: null,
        commissionRate: 1.8,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
