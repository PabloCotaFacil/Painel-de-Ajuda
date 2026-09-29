import TriggerCalculator from '@/components/TriggerCalculator';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Lock, Award, Building2, ShieldAlert } from 'lucide-react';

export const revalidate = 0;

export default async function ComissoesPage() {
  const isAdmin = await checkIsAdmin();

  // If not authenticated as Gestor/Admin, present restricted access screen
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 card-shadow text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Área Restrita aos Gestores das Lojas
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Tabela de Comissionamento & Gatilhos Privados
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              As tabelas de repasse e regras de gatilhos de faturamento são de acesso exclusivo aos Gestores das Lojas CotaFácil.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl transition shadow-md text-sm flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar como Gestor da Loja</span>
            </Link>
            <Link href="/" className="text-xs font-bold text-slate-500 hover:underline">
              Voltar ao Hub de Apoio Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Gestor View
  const products = await prisma.institutionProduct.findMany({
    include: {
      triggerTiers: {
        orderBy: { minVolume: 'asc' },
      },
    },
    orderBy: { bankName: 'asc' },
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-10">
      {/* Top Banner */}
      <div className="gradient-header rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Acesso Restrito aos Gestores das Lojas
          </span>
          <h1 className="text-3xl font-black mt-3">Tabela de Comissionamento & Gatilhos</h1>
          <p className="text-slate-200 text-sm mt-2 max-w-2xl">
            Painel exclusivo para gestores acompanharem as faixas de faturamento mensal e repasses por instituição.
          </p>
        </div>

        <Link
          href="/admin/comissoes"
          className="bg-white text-slate-900 font-extrabold px-5 py-3 rounded-2xl hover:bg-slate-100 transition shadow-lg text-sm shrink-0 flex items-center gap-2"
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Editar Gatilhos no Painel</span>
        </Link>
      </div>

      {/* Interactive Trigger Simulator Component */}
      <TriggerCalculator products={products} />

      {/* Detailed Bank Tables */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-700" />
            Tabelas de Repasse Completa por Instituição
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Confira as faixas de valores e os percentuais aplicados a cada fechamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-3xl p-6 border border-slate-200 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                    {prod.segment}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{prod.bankName}</h3>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-200">
                  {prod.triggerTiers.length} Gatilhos
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3 font-extrabold">Faixa de Produção Mensal</th>
                      <th className="py-2.5 px-3 font-extrabold text-right">Comissão (% Repasse)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prod.triggerTiers.map((tier) => (
                      <tr key={tier.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-slate-700">
                          {formatCurrency(tier.minVolume)}{' '}
                          {tier.maxVolume ? `até ${formatCurrency(tier.maxVolume)}` : ' em diante (+)'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-1 rounded-lg text-sm">
                            {tier.commissionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
