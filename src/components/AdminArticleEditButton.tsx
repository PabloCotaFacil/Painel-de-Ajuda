'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';

export default function AdminArticleEditButton({ articleId }: { articleId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/credentials')
      .then((res) => {
        if (res.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/materiais?edit=${articleId}`}
      className="inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-xl transition shadow-sm"
    >
      <Edit2 className="w-4 h-4" />
      <span>Editar este Material</span>
    </Link>
  );
}
