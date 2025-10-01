import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CometTopBar } from '../components/comet/CometTopBar';
import { Chipbar, ChipbarFilters } from '../components/comet/Chipbar';
import { AnswerStream } from '../components/comet/AnswerStream';
import { SourcesRail, Citation } from '../components/comet/SourcesRail';
import { FollowUps } from '../components/comet/FollowUps';
import { AdSlot, NativeAd } from '../components/AdSlot';
import { BannerCarousel } from '../components/BannerCarousel';
import { Newspaper, FileText, BarChart3, ArrowRight } from 'lucide-react';

export function HomePage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [filters, setFilters] = useState<ChipbarFilters>({
    lens: 'all',
    timespan: '24h',
    region: 'MT',
    mode: 'complete',
  });

  const handleQuery = async (q: string) => {
    setQuery(q);
    setIsStreaming(true);
    setAnswer('');
    setCitations([]);
    setFollowUps([]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockAnswer = `# Resposta sobre: ${q}

Esta é uma resposta simulada do assistente Manduvi. Em produção, esta resposta seria gerada por um modelo de linguagem avançado com acesso a:

- **Base de notícias** agregada de fontes verificadas
- **Serviços institucionais** catalogados
- **Dados públicos** do observatório

## Informações Relevantes

O sistema consultou múltiplas fontes e identificou os seguintes pontos principais:

1. Contexto histórico e situação atual
2. Principais atores e organizações envolvidas
3. Indicadores e dados quantitativos
4. Próximos passos e recomendações

*Nota: Esta é uma demonstração. Em produção, respostas seriam baseadas em dados reais com citações verificáveis.*`;

    const mockCitations: Citation[] = [
      {
        title: 'Saneamento básico em MT avança 12% em 2025',
        source: 'MidiaNews',
        url: '#',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        excerpt:
          'Novo estudo aponta crescimento na cobertura de tratamento de água e esgoto no estado...',
      },
      {
        title: 'Investimentos em infraestrutura alcançam R$ 450 milhões',
        source: 'G1 MT',
        url: '#',
        published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Relatório aponta desafios na gestão de resíduos sólidos',
        source: 'UOL',
        url: '#',
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockFollowUps = [
      'Quais municípios têm melhor cobertura?',
      'Mostrar timeline dos últimos 7 dias',
      'Comparar com outros estados',
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
      <AdSlot format="leaderboard" className="mx-auto mt-4 mb-6" />

      <BannerCarousel className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-brand font-bold tracking-tight">
            o que você procura?
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-ui-muted dark:text-dark-muted">
            assistente inteligente para notícias, serviços e dados do ecossistema de impacto
          </p>
        </div>

        <div className="mx-auto max-w-4xl mb-8">
          <CometTopBar onSubmit={handleQuery} autoFocus />
        </div>

        {query && (
          <>
            <div className="mx-auto max-w-4xl mb-6">
              <Chipbar
                filters={filters}
                onChange={(updates) => setFilters({ ...filters, ...updates })}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <AnswerStream content={answer} isStreaming={isStreaming} />
                {!isStreaming && followUps.length > 0 && (
                  <div className="mt-6">
                    <FollowUps suggestions={followUps} onSelect={handleQuery} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <SourcesRail citations={citations} />
              </div>
            </div>
          </>
        )}

        {!query && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <QuickAction
                icon={<Newspaper />}
                title="notícias"
                description="últimas atualizações com contexto e fontes"
                to="/noticias"
              />
              <QuickAction
                icon={<FileText />}
                title="serviços"
                description="catálogo de serviços institucionais"
                to="/servicos"
              />
              <QuickAction
                icon={<BarChart3 />}
                title="dados"
                description="indicadores e painéis do observatório"
                to="/dados"
              />
            </div>

            <NativeAd
              label="Conheça nossos parceiros de impacto"
              description="Organizações e iniciativas que constroem o futuro sustentável do Brasil Central"
              link="/parceiros"
              className="mx-auto max-w-4xl mb-12"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContentSection
                title="últimas notícias"
                items={[
                  {
                    title: 'Saneamento básico em MT avança 12% em 2025',
                    time: 'há 2h',
                    to: '/noticias',
                  },
                  {
                    title: 'Cuiabá inaugura nova escola indígena com ensino bilíngue',
                    time: 'há 5h',
                    to: '/noticias',
                  },
                  {
                    title: 'Qualidade da água aprovada em 98% das análises',
                    time: 'ontem',
                    to: '/noticias',
                  },
                ]}
                linkTo="/noticias"
              />

              <ContentSection
                title="temas em destaque"
                items={[
                  { title: 'saneamento-mt', time: '24 artigos', to: '/tema/saneamento-mt' },
                  {
                    title: 'educacao-indigena-cuiaba',
                    time: '12 artigos',
                    to: '/tema/educacao-indigena-cuiaba',
                  },
                  { title: 'meio-ambiente', time: '38 artigos', to: '/tema/meio-ambiente' },
                ]}
                linkTo="/temas"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6 text-center transition-all hover:border-brand hover:shadow-soft"
    >
      <div className="mb-4 rounded-xl bg-brand/10 p-4 text-brand transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-brand font-semibold">{title}</h3>
      <p className="text-sm text-ui-muted dark:text-dark-muted">{description}</p>
    </Link>
  );
}

function ContentSection({
  title,
  items,
  linkTo,
}: {
  title: string;
  items: Array<{ title: string; time: string; to: string }>;
  linkTo: string;
}) {
  return (
    <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-brand font-semibold">{title}</h2>
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm text-brand transition-colors hover:text-brand-warm"
        >
          ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className="group flex items-start justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg"
            >
              <span className="flex-1 text-sm text-ui-text dark:text-dark-text group-hover:text-brand">
                {item.title}
              </span>
              <span className="text-xs text-ui-muted dark:text-dark-muted whitespace-nowrap">{item.time}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
