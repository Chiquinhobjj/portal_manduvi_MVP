import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CometTopBar } from '../components/comet/CometTopBar';
import { Chipbar, ChipbarFilters } from '../components/comet/Chipbar';
import { AnswerStream } from '../components/comet/AnswerStream';
import { SourcesRail, Citation } from '../components/comet/SourcesRail';
import { FollowUps } from '../components/comet/FollowUps';
import { SmartAdCarousel } from '../components/SmartAdCarousel';
import { BannerCarousel } from '../components/BannerCarousel';
import { Newspaper, FileText, BarChart3, ArrowRight, Info, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Dados de exemplo para o carrossel de propaganda
  // Remover a variável adItems não utilizada
  // const adItems = [...] - REMOVIDO

  return (
    <div className="min-h-screen">
      <BannerCarousel className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8" />

      {/* PUBLICIDADE MEIO - Segunda posição */}
      <div className="mb-8">
        <SmartAdCarousel
          folderPath="/fotos/propaganda/modelo_BannerCarousel_970x120px"
          location="HOME-MEIO"
          height={480}
          autoRotate={true}
          rotationInterval={8000}
          showNavigation={true}
          showIndicators={true}
          maxImages={5}
          defaultLinkUrl="https://exemplo.com"
          showCTAButton={true}
          ctaText="Saiba Mais"
          ctaUrl="https://exemplo.com/cta"
          ctaPosition="bottom-center"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-brand font-bold tracking-tight">
            o que você procura?
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-ui-muted dark:text-dark-muted">
            assistente inteligente para notícias, serviços e dados do ecossistema manduvi
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
            {/* Nova Seção de Cards Interativos */}
            <MainSectionsCarousel />

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

// Remover a função QuickAction não utilizada
// function QuickAction({...}) {...} - REMOVIDO

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

// Dados das seções principais
const mainSections = [
  {
    title: 'Notícias',
    description: 'Últimas atualizações com contexto e fontes',
    icon: <Newspaper className="w-8 h-8" />,
    to: '/noticias',
    color: 'bg-blue-600',
    bgImage: '/fotos/61.jpg'
  },
  {
    title: 'Serviços',
    description: 'Catálogo de serviços institucionais',
    icon: <FileText className="w-8 h-8" />,
    to: '/servicos',
    color: 'bg-green-600',
    bgImage: '/fotos/62.jpg'
  },
  {
    title: 'Dados',
    description: 'Indicadores e painéis do observatório',
    icon: <BarChart3 className="w-8 h-8" />,
    to: '/dados',
    color: 'bg-purple-600',
    bgImage: '/fotos/63.jpg'
  },
  {
    title: 'Instituto',
    description: 'Conheça nossa missão e impacto',
    icon: <Info className="w-8 h-8" />,
    to: '/instituto',
    color: 'bg-orange-600',
    bgImage: '/fotos/65.jpg'
  }
];

// Componente do Card Individual
function SectionCard({ section }: { section: typeof mainSections[0] }) {
  return (
    <Link 
      to={section.to}
      className="relative h-[280px] text-white group overflow-hidden cursor-pointer flex-shrink-0 w-full rounded-xl"
    >
      <img 
        src={section.bgImage} 
        alt={section.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      /> 
      <div className={`absolute inset-0 ${section.color} opacity-80 mix-blend-multiply transition-transform duration-500 group-hover:scale-110`}></div> 
      <div className="absolute top-4 right-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300"> 
        <Info className="w-6 h-6"/> 
      </div> 
      <div className="relative z-10 flex flex-col justify-between h-full p-6"> 
        <div className="text-white/90 group-hover:text-white transition-colors duration-300"> 
          {section.icon}
        </div> 
        <div className="space-y-3"> 
          <h3 className="text-xl font-bold">{section.title}</h3> 
          <p className="text-sm font-medium leading-relaxed opacity-90"> 
            {section.description} 
          </p> 
          <button className="border-2 border-white text-white font-semibold py-2 px-5 hover:bg-white hover:text-black transition-all duration-300 rounded-lg group-hover:scale-105"> 
            Conheça 
          </button> 
        </div> 
      </div> 
    </Link>
  );
}

// Componente Principal do Carrossel
function MainSectionsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Responsividade - ajustar quantos itens mostrar por tela
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 itens
      } else {
        setItemsPerView(3); // Desktop: 3 itens
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, mainSections.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, itemsPerView]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, mainSections.length - itemsPerView);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, mainSections.length - itemsPerView);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const maxIndex = Math.max(0, mainSections.length - itemsPerView);

  return (
    <section className="py-16 mb-12">
      {/* Header da Seção */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-4">
          Explore Nossas Áreas
        </h2>
        <p className="text-lg text-ui-muted dark:text-dark-muted max-w-3xl mx-auto">
          Descubra informações, serviços e dados que impulsionam o desenvolvimento sustentável
        </p>
      </div>

      {/* Container do Carrossel */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Botões de Navegação */}
        {mainSections.length > itemsPerView && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-ui-text dark:text-dark-text rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Seção anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-ui-text dark:text-dark-text rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Próxima seção"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Cards Container */}
        <div className="flex transition-transform duration-500 ease-in-out px-4">
          <div 
            className="flex"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(mainSections.length / itemsPerView) * 100}%`
            }}
          >
            {mainSections.map((section, index) => (
              <div key={index} style={{ width: `${100 / mainSections.length}%` }}>
                <SectionCard section={section} />
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores */}
        {maxIndex > 0 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-brand scale-110' 
                    : 'bg-ui-muted dark:bg-dark-muted hover:bg-brand/50'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}