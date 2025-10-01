import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, Download, ArrowRight } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { formatNumber } from '../lib/utils';

interface Dataset {
  slug: string;
  title: string;
  summary: string;
  category: string;
  last_updated: string;
}

interface Indicator {
  indicator_key: string;
  label: string;
  value: number;
  unit: string;
}

export function DadosPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: datasetsData } = await supabase
      .from('datasets')
      .select('slug, title, summary, category, last_updated')
      .order('title');

    const { data: indicatorsData } = await supabase
      .from('dataset_indicators')
      .select('indicator_key, label, value, unit')
      .order('created_at', { ascending: false })
      .limit(6);

    if (datasetsData) setDatasets(datasetsData);
    if (indicatorsData) setIndicators(indicatorsData);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-brand font-semibold mb-4">indicadores em destaque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators.map((indicator) => (
              <IndicatorCard key={indicator.indicator_key} indicator={indicator} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-brand font-semibold mb-4">conjuntos de dados</h2>

            {datasets.length === 0 ? (
              <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-ui-muted dark:text-dark-muted mb-4" />
                <p className="text-ui-muted dark:text-dark-muted">Carregando datasets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {datasets.map((dataset) => (
                  <DatasetCard key={dataset.slug} dataset={dataset} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AdSlot 
              format="mpu" 
              imageUrl="/fotos/propaganda/freepik-projeto-sem-titulo-20251001161418FBLo.png"
              altText="[DADOS] MPU Sidebar - Material Publicitário"
              linkUrl="https://exemplo.com/dados-mpu"
            />

            <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
              <h3 className="text-sm font-brand font-semibold mb-4">
                análise com IA
              </h3>
              <p className="text-sm text-ui-muted dark:text-dark-muted mb-4 leading-relaxed">
                Pergunte ao assistente sobre qualquer indicador e receba análises contextualizadas em
                tempo real.
              </p>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
              >
                analisar dados
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
              <h3 className="text-sm font-brand font-semibold mb-4">exportar dados</h3>
              <p className="text-sm text-ui-muted dark:text-dark-muted mb-4 leading-relaxed">
                Todos os datasets podem ser exportados em formato CSV ou PNG para uso em suas
                análises.
              </p>
              <button className="flex items-center justify-center gap-2 w-full rounded-lg border border-ui-border bg-ui-bg px-4 py-2 text-sm font-medium text-ui-text transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel">
                <Download className="h-4 w-4" />
                baixar dados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium uppercase tracking-wide text-ui-muted dark:text-dark-muted">
          {indicator.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-ui-text dark:text-dark-text">
          {formatNumber(indicator.value)}
        </span>
        <span className="text-sm text-ui-muted dark:text-dark-muted">{indicator.unit}</span>
      </div>
    </div>
  );
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Link
      to={`/dados/${dataset.slug}`}
      className="group block rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6 transition-all hover:border-brand hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand" />
            {dataset.category && (
              <span className="text-xs text-ui-muted dark:text-dark-muted">{dataset.category}</span>
            )}
          </div>
          <h3 className="text-lg font-brand font-semibold group-hover:text-brand">
            {dataset.title}
          </h3>
        </div>
        <ArrowRight className="h-5 w-5 text-ui-muted transition-all group-hover:translate-x-1 group-hover:text-brand" />
      </div>

      <p className="mb-3 text-sm text-ui-muted leading-relaxed">{dataset.summary}</p>

      {dataset.last_updated && (
        <div className="text-xs text-ui-muted dark:text-dark-muted">
          atualizado em {new Date(dataset.last_updated).toLocaleDateString('pt-BR')}
        </div>
      )}
    </Link>
  );
}
