'use client';

import { useState, useEffect } from 'react';

export default function ArticleReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setCompletion(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (completion <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
