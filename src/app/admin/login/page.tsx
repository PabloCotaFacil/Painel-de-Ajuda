'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Senha incorreta');
        setLoading(false);
      } else {
        router.push('/admin/materiais');
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 card-shadow space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Área Administrativa</h1>
          <p className="text-xs text-slate-500">
            Digite sua senha para acessar o painel privado de gestão de PDFs, materiais e comissões.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-xl border border-rose-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">SENHA DE ADMINISTRADOR</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Senha padrão em desenvolvimento: <code className="font-bold text-slate-700">admin</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl transition shadow-md text-sm flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Entrando...' : 'Entrar no Painel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
