import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Imob Ajuda | Crédito Imobiliário, PJ e Agro',
  description: 'Portal de conhecimento, regras de crédito e tabelas de comissão com gatilhos de produção.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col justify-between">
        <div>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-white text-sm">Imob Ajuda — Giro & Agro</p>
              <p className="mt-1 text-slate-500">
                Plataforma de regras de crédito, manuais operacionais e gatilhos de comissionamento.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-slate-300">
              <a href="/comissoes" className="hover:text-cyan-400 transition">Tabelas de Comissão</a>
              <a href="/admin/materiais" className="hover:text-cyan-400 transition">Área Administrativa</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
