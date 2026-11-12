import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getKnowledgeSnapshot,
  retrieveRelevantSources,
  loadInlinePdfsForSources,
  type ScoredSource,
} from '@/lib/aiKnowledge';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function buildContextPrompt(
  sources: ScoredSource[],
  allTitles: Array<{ id: string; title: string; categoryName: string; hasPdf: boolean }>,
  reels: Array<{ title: string; description: string | null; categoryTag: string | null }>
): string {
  const detailedDocs = sources
    .map((s) => {
      const attList =
        s.attachments.length > 0
          ? `Anexos PDF: ${s.attachments.map((a) => a.name).join(', ')}`
          : 'Sem PDF anexo';
      return [
        `[${s.index}] TÍTULO: ${s.title}`,
        `CATEGORIA: ${s.categoryName}`,
        attList,
        `RESUMO: ${s.summary}`,
        s.plainContent ? `CONTEÚDO:\n${s.plainContent}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n====================\n\n');

  const catalogIndex = allTitles
    .slice(0, 60)
    .map(
      (a, i) =>
        `- ${a.title} (${a.categoryName}${a.hasPdf ? ' • PDF' : ''})`
    )
    .join('\n');

  const reelsIndex =
    reels.length > 0
      ? reels
          .slice(0, 20)
          .map(
            (r) =>
              `- ${r.title}${r.categoryTag ? ` [${r.categoryTag}]` : ''}${
                r.description ? `: ${r.description}` : ''
              }`
          )
          .join('\n')
      : '';

  return `MATERIAIS PRINCIPAIS RELACIONADOS À PERGUNTA (CITE PELO NÚMERO [1], [2], etc.):

${detailedDocs || 'Nenhum material detalhado cadastrado ainda.'}

--------------------
CATÁLOGO GERAL DO PAINEL:
${catalogIndex || 'Vazio'}
${reelsIndex ? `\nVÍDEOS CURTOS / REELS:\n${reelsIndex}` : ''}`;
}

function buildLocalFallbackAnswer(
  question: string,
  sources: ScoredSource[]
): { answer: string; sourcesToReturn: ScoredSource[] } {
  const matched = sources.filter((s) => s.score > 0);
  if (matched.length === 0) {
    return {
      answer:
        'Não encontrei informações diretamente correspondentes nos materiais cadastrados no painel.\n\nTente reformular a pergunta com o nome do banco ou assunto, ou fale diretamente com o suporte no botão do WhatsApp abaixo.',
      sourcesToReturn: [],
    };
  }

  const lines = matched.slice(0, 4).map((s) => {
    const snippet = s.plainContent
      ? s.plainContent.slice(0, 260).replace(/\n+/g, ' ').trim()
      : s.summary;
    const ellipsis = s.plainContent && s.plainContent.length > 260 ? '...' : '';
    return `**[${s.index}] ${s.title}** (${s.categoryName})\n${s.summary}${
      snippet && snippet !== s.summary ? `\n> ${snippet}${ellipsis}` : ''
    }`;
  });

  return {
    answer: `Encontrei os seguintes materiais relacionados a **"${question}"**:\n\n${lines.join(
      '\n\n'
    )}\n\nClique em qualquer fonte abaixo para abrir o material completo ou baixar o PDF.`,
    sourcesToReturn: matched.slice(0, 5),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const history: ChatTurn[] = Array.isArray(body?.history)
      ? body.history.slice(-6)
      : [];

    if (!question) {
      return NextResponse.json({ error: 'Pergunta vazia' }, { status: 400 });
    }

    const [snapshot, providerCfg, keyCfg] = await Promise.all([
      getKnowledgeSnapshot(),
      prisma.systemConfig.findUnique({ where: { key: 'ai_provider' } }),
      prisma.systemConfig.findUnique({ where: { key: 'ai_api_key' } }),
    ]);

    const sources = retrieveRelevantSources(snapshot, question, 8);
    const allTitles = snapshot.articles.map((a) => ({
      id: a.id,
      title: a.title,
      categoryName: a.categoryName,
      hasPdf: a.attachments.length > 0,
    }));

    const envGemini =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    const envOpenai = process.env.OPENAI_API_KEY || '';

    const apiKey = keyCfg?.value || envGemini || envOpenai || '';
    const provider: 'gemini' | 'openai' =
      (providerCfg?.value as 'gemini' | 'openai') ||
      (keyCfg?.value?.startsWith('sk-') ? 'openai' : envOpenai && !envGemini ? 'openai' : 'gemini');

    if (!apiKey) {
      const local = buildLocalFallbackAnswer(question, sources);
      return NextResponse.json({
        answer: local.answer,
        sources: local.sourcesToReturn.map((s) => ({
          index: s.index,
          id: s.id,
          title: s.title,
          categoryName: s.categoryName,
          hasPdf: s.hasPdf,
          url: s.url,
        })),
        mode: 'local',
        needsApiKey: true,
      });
    }

    const contextText = buildContextPrompt(sources, allTitles, snapshot.reels);

    const systemInstruction = `Você é o assistente de consulta do Painel Operacional CotaFácil (estilo Google NotebookLM).
Regras obrigatórias:
1. Responda em português do Brasil de forma clara, objetiva e profissional.
2. Baseie sua resposta EXCLUSIVAMENTE nos materiais, regras e PDFs fornecidos no contexto abaixo. Nunca invente taxas, prazos, documentos ou regras bancárias que não estejam nos materiais.
3. Sempre cite as fontes usadas utilizando [1], [2], etc., exatamente conforme os números dos materiais fornecidos.
4. Se a informação solicitada não constar em nenhum material do painel, informe claramente que não foi encontrada na base atual e oriente consultar a equipe de suporte no WhatsApp.
5. Organize respostas com tópicos curtos quando houver listas de documentos, requisitos ou passos.`;

    if (provider === 'openai') {
      const messages = [
        { role: 'system', content: `${systemInstruction}\n\n${contextText}` },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: question },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          messages,
        }),
      });

      if (!res.ok) {
        const local = buildLocalFallbackAnswer(question, sources);
        return NextResponse.json({
          answer: local.answer,
          sources: local.sourcesToReturn.map((s) => ({
            index: s.index,
            id: s.id,
            title: s.title,
            categoryName: s.categoryName,
            hasPdf: s.hasPdf,
            url: s.url,
          })),
          mode: 'local',
        });
      }

      const data = await res.json();
      const answer =
        data?.choices?.[0]?.message?.content?.trim() ||
        'Não foi possível gerar uma resposta no momento.';

      return NextResponse.json({
        answer,
        sources: sources.map((s) => ({
          index: s.index,
          id: s.id,
          title: s.title,
          categoryName: s.categoryName,
          hasPdf: s.hasPdf,
          url: s.url,
        })),
        mode: 'openai',
      });
    }

    // Google Gemini (com suporte multimodal nativo para PDFs anexos relevantes!)
    const inlinePdfs = await loadInlinePdfsForSources(sources);
    const userParts: Array<Record<string, any>> = [
      {
        text: `${contextText}\n\n${
          history.length > 0
            ? `HISTÓRICO DA CONVERSA:\n${history
                .map((h) => `${h.role === 'user' ? 'Usuário' : 'Assistente'}: ${h.content}`)
                .join('\n')}\n\n`
            : ''
        }PERGUNTA DO USUÁRIO:\n${question}`,
      },
    ];

    for (const pdf of inlinePdfs) {
      userParts.push({
        text: `PDF anexo da fonte [${pdf.sourceIndex}] (${pdf.name}):`,
      });
      userParts.push({
        inline_data: {
          mime_type: pdf.mimeType,
          data: pdf.base64Data,
        },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: userParts,
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const local = buildLocalFallbackAnswer(question, sources);
      return NextResponse.json({
        answer: local.answer,
        sources: local.sourcesToReturn.map((s) => ({
          index: s.index,
          id: s.id,
          title: s.title,
          categoryName: s.categoryName,
          hasPdf: s.hasPdf,
          url: s.url,
        })),
        mode: 'local',
      });
    }

    const geminiData = await geminiRes.json();
    const answer =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text || '')
        .join('')
        .trim() || 'Não foi possível formular uma resposta com os materiais atuais.';

    return NextResponse.json({
      answer,
      sources: sources.map((s) => ({
        index: s.index,
        id: s.id,
        title: s.title,
        categoryName: s.categoryName,
        hasPdf: s.hasPdf,
        url: s.url,
      })),
      mode: 'gemini',
    });
  } catch (error) {
    console.error('Erro no assistente IA:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar os materiais do sistema' },
      { status: 500 }
    );
  }
}
