'use client';

import { useState } from 'react';
import { MessageCircle, HelpCircle, X, ExternalLink } from 'lucide-react';

interface SupportHelpDeskProps {
  whatsappNumber?: string; // ex: '5511999999999'
  helpDeskUrl?: string;
}

export default function SupportHelpDesk({
  whatsappNumber = '5517997750058', // Número padrão ou configurável CotaFácil
  helpDeskUrl,
}: SupportHelpDeskProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const defaultMessage = encodeURIComponent(
    'Olá! Estou consultando o Hub de Apoio Operacional CotaFácil e gostaria de tirar uma dúvida sobre uma esteira.'
  );
  const waLink = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Menu flutuante de atendimento rápido */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Suporte Operacional
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Ficou com alguma dúvida sobre esteiras bancárias, aprovação ou checklist? Fale com a equipe de apoio da Matriz.
          </p>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>

          {helpDeskUrl && (
            <a
              href={helpDeskUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Chamado / Ticket</span>
            </a>
          )}
        </div>
      )}

      {/* Botão de Disparo Flutuante */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-white/60 dark:ring-slate-900/60"
        title="Dúvidas sobre a esteira? Fale com o Apoio"
        aria-label="Abrir atendimento de apoio"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
