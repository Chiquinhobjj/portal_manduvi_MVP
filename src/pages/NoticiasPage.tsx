import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CometTopBar } from '../components/comet/CometTopBar';
import { Chipbar, ChipbarFilters } from '../components/comet/Chipbar';
import { AnswerStream } from '../components/comet/AnswerStream';
import { SourcesRail, Citation } from '../components/comet/SourcesRail';
import { FollowUps } from '../components/comet/FollowUps';
import { AdSlot } from '../components/AdSlot';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { Clock, TrendingUp } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  lead: string | null;
  url: string;
  published_at: string;
  source: {
    name: string;
  };
}

export function NoticiasPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filters, setFilters] = useState<ChipbarFilters>({
    lens: 'news',
    timespan: '24h',
    region: 'MT',
    mode: 'complete',
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        lead,
        url,
        published_at,
        source:sources(name)
      `
      )
      .order('published_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setArticles(data as unknown as Article[]);
    }
  };

  const handleQuery = async (q: string) => {
    setQuery(q);
    setIsStreaming(true);
    setAnswer('');
    setCitations([]);
    setFollowUps([]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockAnswer = `# Análise: ${q}

Baseado nas notícias mais recentes sobre **${q}**, aqui está um resumo contextualizado:

## Situação Atual

Os últimos desenvolvimentos apontam para mudanças significativas na região. Múltiplas fontes confirmam o crescimento dos indicadores principais.

## Principais Acontecimentos

- Aumento de 12% nos investimentos do setor
- Novas políticas públicas anunciadas pelo governo estadual
- Participação ativa da sociedade civil organizada

## Perspectivas

Especialistas indicam tendência de expansão para os próximos meses, com possíveis desdobramentos em áreas correlatas.

*Esta análise foi gerada consultando 8 fontes verificadas nas últimas 24 horas.*`;

    const mockCitations: Citation[] = articles.slice(0, 3).map((article) => ({
      title: article.title,
      source: article.source.name,
      url: article.url,
      published_at: article.published_at,
      excerpt: article.lead || undefined,
    }));

    const mockFollowUps = [
      'Mostrar timeline completa dos últimos 7 dias',
      'Quais as opiniões divergentes sobre o tema?',
      'Comparar com situação de outros estados',
    ];

    let currentText = '';
    const words = mockAnswer.split(' ');

    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + ' ';
      setAnswer(currentText);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    setIsStreaming(false);
    setCitations(mockCitations);
    setFollowUps(mockFollowUps);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted">
                ao vivo
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-brand font-bold">notícias manduvi</h1>
            <p className="mt-2 text-ui-muted dark:text-dark-muted">
              notícias agregadas com contexto, fontes verificadas e análise por IA
            </p>
          </div>

          <CometTopBar
            onSubmit={handleQuery}
            placeholder="pergunte sobre qualquer notícia..."
          />

          <div className="mt-4">
            <Chipbar
              filters={filters}
              onChange={(updates) => setFilters({ ...filters, ...updates })}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {query ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AnswerStream content={answer} isStreaming={isStreaming} />
              {!isStreaming && followUps.length > 0 && (
                <FollowUps suggestions={followUps} onSelect={handleQuery} />
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <SourcesRail citations={citations} />
              <AdSlot 
                format="mpu" 
                imageUrl="/fotos/propaganda/freepik-projeto-sem-titulo-20251001161418FBLo.png"
                altText="[NOTÍCIAS] MPU Sidebar - Material Publicitário 1"
                linkUrl="https://exemplo.com/noticias-mpu-1"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-brand font-semibold">últimas notícias</h2>
                </div>

                <div className="space-y-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <AdSlot 
                format="mpu" 
                imageUrl="/fotos/propaganda/freepik-projeto-sem-titulo-20251001161418FBLo.png"
                altText="[NOTÍCIAS] MPU Sidebar - Material Publicitário 2"
                linkUrl="https://exemplo.com/noticias-mpu-2"
              />

              <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
                <h3 className="text-sm font-brand font-semibold mb-4">temas populares</h3>
                <div className="space-y-2">
                  <TopicTag label="saneamento-mt" count={24} />
                  <TopicTag label="educacao-indigena" count={12} />
                  <TopicTag label="meio-ambiente" count={38} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg p-4 transition-all hover:border-brand hover:shadow-md">
      <div className="mb-2 flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
        <span className="font-medium">{article.source.name}</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>

      <Link to={article.url} target="_blank" rel="noopener noreferrer">
        <h3 className="mb-2 text-base font-semibold leading-snug text-ui-text dark:text-dark-text group-hover:text-brand">
          {article.title}
        </h3>
      </Link>

      {article.lead && (
        <p className="text-sm text-ui-muted dark:text-dark-muted leading-relaxed line-clamp-2">{article.lead}</p>
      )}
    </article>
  );
}

function TopicTag({ label, count }: { label: string; count: number }) {
  return (
    <Link
      to={`/tema/${label}`}
      className="flex items-center justify-between rounded-lg bg-ui-bg px-3 py-2 transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel"
    >
      <span className="text-sm text-ui-text dark:text-dark-text">{label}</span>
      <span className="text-xs text-ui-muted dark:text-dark-muted">{count}</span>
    </Link>
  );
}
