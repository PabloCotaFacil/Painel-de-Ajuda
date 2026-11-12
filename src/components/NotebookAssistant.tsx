'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  FileText,
  BookOpen,
  RotateCcw,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export interface AssistantSource {
  index: number;
  id: string;
  title: string;
  categoryName: string;
  hasPdf: boolean;
  url: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AssistantSource[];
  mode?: 'gemini' | 'openai' | 'local';
  needsApiKey?: boolean;
}

interface NotebookAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const STARTER_QUESTIONS = [
  'Quais documentos são exigidos para crédito imobiliário?',
  'Como funciona a avaliação de engenharia?',
  'Quais são as regras do FGTS no financiamento?',
];

function renderFormattedLine(line: string, keyPrefix: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${idx}`} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${idx}`}>{part}</span>;
  });
}

function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span>{renderFormattedLine(trimmed.slice(2), `li-${i}`)}</span>
            </div>
          );
        }
        return <p key={i}>{renderFormattedLine(line, `p-${i}`)}</p>;
      })}
    </div>
  );
}

export default function NotebookAssistant({
  isOpen,
  onToggle,
  onClose,
}: NotebookAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function askQuestion(questionText: string) {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao consultar os materiais.');
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Não foi possível gerar uma resposta no momento.',
        sources: Array.isArray(data.sources) ? data.sources : [],
        mode: data.mode,
        needsApiKey: Boolean(data.needsApiKey),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro de conexão ao consultar a IA.';
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    askQuestion(input);
  }

  function handleReset() {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[75vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 px-4 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Assistente dos Materiais</h4>
                <p className="text-[11px] text-blue-100 leading-tight">
                  Busca nos manuais, PDFs e vídeos do painel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Nova conversa"
                  aria-label="Nova conversa"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                title="Fechar assistente"
                aria-label="Fechar assistente"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/60 select-text">
            {messages.length === 0 ? (
              <div className="space-y-3 py-2">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Pergunte qualquer coisa sobre os materiais
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Consulto os artigos, guias de bancos, PDFs e videoaulas publicados no sistema e indico as fontes exatas.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                    Sugestões
                  </span>
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => askQuestion(q)}
                      className="w-full text-left text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl px-3 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span>{q}</span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] bg-indigo-600 text-white text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-br-sm shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm p-3.5 shadow-sm space-y-3">
                      <FormattedAnswer text={msg.content} />

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Fontes consultadas
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src) => (
                              <Link
                                key={src.id}
                                href={src.url}
                                onClick={onClose}
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                {src.hasPdf ? (
                                  <FileText className="w-3 h-3 text-rose-500 shrink-0" />
                                ) : (
                                  <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                                )}
                                <span className="truncate max-w-[200px]">
                                  [{src.index}] {src.title}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 w-fit shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Consultando materiais do sistema...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre bancos, regras, PDFs..."
              disabled={loading}
              className="flex-1 text-xs sm:text-[13px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar pergunta"
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center space-x-3">
        {!isOpen && (
          <div
            onClick={onToggle}
            className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-transform hover:-translate-x-1"
          >
            <span>
              Pergunte à <strong className="text-indigo-600 dark:text-indigo-400">IA dos Materiais</strong>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-500 hover:brightness-110 text-white shadow-2xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-white dark:ring-slate-900 cursor-pointer relative group"
          title="Assistente IA dos Materiais"
          aria-label="Abrir Assistente IA dos Materiais"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
}
