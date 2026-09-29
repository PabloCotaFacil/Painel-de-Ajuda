'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, Award } from 'lucide-react';

interface TriggerTier {
  id: string;
  minVolume: number;
  maxVolume: number | null;
  commissionRate: number;
}

interface ProductWithTiers {
  id: string;
  bankName: string;
  segment: string;
  description: string | null;
  triggerTiers: TriggerTier[];
}

export default function TriggerCalculator({ products }: { products: ProductWithTiers[] }) {
  const [productionVolume, setProductionVolume] = useState<number>(750000);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 card-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <span className="bg-cotafacil-orange text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Simulador de Repasse CotaFácil
          </span>
          <h2 className="text-2xl font-black text-cotafacil-teal mt-2 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-cotafacil-orange" />
            Simule sua Produção & Descubra a Comissão
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Quanto mais você produz no mês, maior é o seu percentual de comissionamento.
          </p>
        </div>

        {/* Interactive Volume Input */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[280px]">
          <label className="text-xs font-extrabold text-slate-700 block mb-1">PRODUÇÃO ESTIMADA NO MÊS</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">R$</span>
            <input
              type="number"
              value={productionVolume}
              onChange={(e) => setProductionVolume(Number(e.target.value) || 0)}
              step={50000}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-cotafacil-teal focus:outline-none"
            />
          </div>
          <input
            type="range"
            min={0}
            max={5000000}
            step={50000}
            value={productionVolume}
            onChange={(e) => setProductionVolume(Number(e.target.value))}
            className="w-full mt-3 accent-cotafacil-orange cursor-pointer"
          />
        </div>
      </div>

      {/* Grid of Bank Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => {
          const activeTier = prod.triggerTiers.find((tier) => {
            if (tier.maxVolume === null) {
              return productionVolume >= tier.minVolume;
            }
            return productionVolume >= tier.minVolume && productionVolume <= tier.maxVolume;
          }) || prod.triggerTiers[0];

          const nextTier = prod.triggerTiers.find((tier) => tier.minVolume > productionVolume);
          const currentRate = activeTier ? activeTier.commissionRate : 0;
          const estimatedEarnings = (productionVolume * currentRate) / 100;

          return (
            <div
              key={prod.id}
              className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-cotafacil-teal transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 text-cotafacil-teal uppercase">
                    {prod.segment}
                  </span>
                  <Award className="w-5 h-5 text-cotafacil-orange" />
                </div>
                <h3 className="text-lg font-black text-slate-900">{prod.bankName}</h3>
                <p className="text-xs text-slate-500 mb-4">{prod.description || 'Gatilho por volume mensal'}</p>

                {/* Active Rate Box */}
                <div className="bg-cotafacil-teal text-white rounded-xl p-4 mb-4 text-center shadow-inner">
                  <span className="text-xs uppercase font-bold text-slate-300 block">Taxa de Comissão Ativada</span>
                  <span className="text-3xl font-black text-cotafacil-amber">{currentRate}%</span>
                  <div className="mt-2 text-xs font-bold text-slate-100 bg-white/10 py-1 px-3 rounded-lg inline-block">
                    Retorno Estimado: {formatCurrency(estimatedEarnings)}
                  </div>
                </div>

                {/* Trigger Tiers List */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-slate-600 block mb-1">Faixas de Gatilho:</span>
                  {prod.triggerTiers.map((tier) => {
                    const isCurrent = activeTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        className={`text-xs p-2.5 rounded-xl border flex justify-between items-center transition ${
                          isCurrent
                            ? 'bg-orange-50 border-cotafacil-orange text-slate-900 font-extrabold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>
                          {formatCurrency(tier.minVolume)}{' '}
                          {tier.maxVolume ? `até ${formatCurrency(tier.maxVolume)}` : '+'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${isCurrent ? 'bg-cotafacil-orange text-white font-black' : 'bg-slate-100 text-slate-700 font-bold'}`}>
                          {tier.commissionRate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Target Indicator */}
              {nextTier ? (
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Falta para gatilho ({nextTier.commissionRate}%):</span>
                  <span className="font-extrabold text-cotafacil-teal">
                    {formatCurrency(nextTier.minVolume - productionVolume)}
                  </span>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200 text-xs text-cotafacil-green font-bold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Comissão máxima deste produto atingida! 🔥</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
