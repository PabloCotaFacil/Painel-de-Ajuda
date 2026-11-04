'use client';

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

function WhatsAppIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
    </svg>
  );
}

interface SupportHelpDeskProps {
  whatsappNumber?: string; // ex: '5511999999999'
  helpDeskUrl?: string;
}

export default function SupportHelpDesk({
  whatsappNumber = '5517997750058',
  helpDeskUrl,
}: SupportHelpDeskProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const defaultMessage = encodeURIComponent(
    'Olá! Estou consultando o Hub de Apoio Operacional CotaFácil e gostaria de tirar uma dúvida sobre uma esteira de crédito imobiliário.'
  );
  const waLink = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none flex flex-col items-end">
      {/* Menu flutuante de atendimento rápido */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366]"></span>
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Apoio Operacional
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Equipe de Suporte Online
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Dúvidas sobre esteiras de crédito imobiliário, aprovação bancária ou regras operacionais? Fale diretamente com o suporte da Matriz CotaFácil pelo WhatsApp.
          </p>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl text-xs font-black flex items-center justify-center space-x-2.5 transition shadow-lg shadow-emerald-600/30 active:scale-[0.98]"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>Iniciar Conversa no WhatsApp</span>
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

      {/* Botão de Disparo Flutuante - Grande, Verde WhatsApp Oficial e Chamativo */}
      <div className="flex items-center space-x-3">
        {/* Balão de chamada (badge) que destaca o suporte no desktop */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-transform hover:-translate-x-1"
          >
            <span>Dúvidas? <strong className="text-emerald-600 dark:text-emerald-400">Chame no WhatsApp</strong></span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-600/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-white dark:ring-slate-900 cursor-pointer relative group"
          title="Falar com o Suporte Operacional no WhatsApp"
          aria-label="Abrir suporte no WhatsApp"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="relative flex items-center justify-center">
              <WhatsAppIcon className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 ring-2 ring-[#25D366]"></span>
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
