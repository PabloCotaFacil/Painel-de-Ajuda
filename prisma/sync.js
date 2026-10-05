const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const categories = await prisma.category.findMany();
  console.log('Categories count:', categories.length);
  if (categories.length === 0) {
    console.log('Seeding categories into Supabase...');
    const defaults = [
      { name: 'Crédito Imobiliário', slug: 'imobiliario', description: 'Financiamento habitacional, Home Equity, repasse bancário e regras de LTV.', icon: 'home' },
      { name: 'Crédito PJ & Giro', slug: 'credito-pj', description: 'Capital de Giro, FGO, Pronampe, Antecipação de Recebíveis e Linhas de Garantia.', icon: 'building' },
      { name: 'Crédito Agro', slug: 'credito-agro', description: 'Custeio agrícola/pecuário, CPR, Investimento, Moderfrota e Pronaf.', icon: 'sprout' },
      { name: 'Regras & Treinamentos', slug: 'treinamentos', description: 'Vídeos de treinamento, esteiras operacionais, resumos de regras e manuais.', icon: 'book' },
    ];
    for (const c of defaults) {
      await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    }
    const updated = await prisma.category.findMany();
    console.log('Updated categories count:', updated.length);
  } else {
    categories.forEach(c => console.log(' -', c.name, '(', c.slug, ')'));
  }

  // Also check heroBanner
  const banner = await prisma.heroBanner.findUnique({ where: { id: 'default-hero' } });
  console.log('Hero banner:', banner ? banner.title : 'null');
  if (!banner) {
    await prisma.heroBanner.create({
      data: {
        id: 'default-hero',
        badgeText: 'Regras & Manuais Safra 2025/2026',
        title: 'Hub de apoio Imobiliário, Crédito PJ & Agro',
        subtitle: 'Consulte manuais operacionais de bancos, downloads de PDFs com checklist de esteira e regras operacionais atualizadas.',
        primaryButtonText: 'Ver Regras & Manuais',
        primaryButtonUrl: '/categorias/treinamentos',
        secondaryButtonText: '',
        secondaryButtonUrl: '',
      }
    });
    console.log('Created default hero banner');
  } else {
    if (banner.secondaryButtonUrl && (banner.secondaryButtonUrl.includes('admin') || banner.secondaryButtonUrl.includes('comissoes'))) {
      await prisma.heroBanner.update({
        where: { id: 'default-hero' },
        data: { secondaryButtonText: '', secondaryButtonUrl: '' }
      });
      console.log('Cleaned secondary button in hero banner');
    }
  }

  const articles = await prisma.article.findMany();
  console.log('Articles count:', articles.length);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
