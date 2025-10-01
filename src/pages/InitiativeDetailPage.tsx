import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  MapPin,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowLeft,
  Target,
  Handshake
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface Initiative {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string | null;
  category: string;
  status: string;
  beneficiaries: number;
  start_year: number | null;
  end_year: number | null;
  featured: boolean;
  image_url: string | null;
  ods_goals: string[];
  locations: string[];
  partners: string[];
}

interface Impact {
  metric: string;
  value: number;
  unit: string | null;
}

interface Milestone {
  title: string;
  description: string | null;
  date: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Esporte': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'Educação': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  'Saúde': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  'Assistência Social': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  'Tecnologia': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  'Inclusão': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400' },
  'Institucional': { bg: 'bg-[#603813]/10', text: 'text-[#603813] dark:text-[#854224]' },
};

export function InitiativeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchInitiativeData();
    }
  }, [slug]);

  async function fetchInitiativeData() {
    try {
      const [initiativeData, impactsData, milestonesData] = await Promise.all([
        supabase.from('initiatives').select('*').eq('slug', slug).maybeSingle(),
        supabase.from('initiative_impacts').select('*').eq('initiative_slug', slug).order('order_index'),
        supabase.from('initiative_milestones').select('*').eq('initiative_slug', slug).order('date', { ascending: false }),
      ]);

      if (initiativeData.data) {
        setInitiative(initiativeData.data);
      } else {
        navigate('/iniciativas');
      }

      if (impactsData.data) setImpacts(impactsData.data);
      if (milestonesData.data) setMilestones(milestonesData.data);
    } catch (error) {
      logger.error('Error fetching initiative:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!initiative) {
    return null;
  }

  const categoryStyle = categoryColors[initiative.category] || categoryColors['Institucional'];

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="border-b border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/iniciativas"
            className="inline-flex items-center gap-2 text-sm text-ui-muted dark:text-dark-muted hover:text-brand transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para iniciativas
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
              {initiative.category}
            </span>
            {initiative.status === 'active' && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                Ativo
              </span>
            )}
            {initiative.status === 'completed' && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
                Concluído
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-brand font-bold mb-3">
            {initiative.name}
          </h1>
          <p className="text-lg sm:text-xl text-ui-muted dark:text-dark-muted max-w-3xl">
            {initiative.tagline}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {impacts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {impacts.map((impact, index) => (
              <div
                key={index}
                className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 text-center border border-ui-border dark:border-dark-border"
              >
                <div className="text-3xl md:text-4xl font-bold text-brand mb-2">
                  {impact.value.toLocaleString()}{impact.unit === '%' ? '%' : ''}
                </div>
                <div className="text-sm text-ui-muted dark:text-dark-muted">
                  {impact.metric}
                  {impact.unit && impact.unit !== '%' && ` (${impact.unit})`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 md:p-8 border border-ui-border dark:border-dark-border">
              <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-brand" />
                Sobre a Iniciativa
              </h2>
              <p className="text-ui-muted dark:text-dark-muted leading-relaxed mb-4">
                {initiative.description}
              </p>
              {initiative.long_description && (
                <p className="text-ui-muted dark:text-dark-muted leading-relaxed">
                  {initiative.long_description}
                </p>
              )}
            </section>

            {milestones.length > 0 && (
              <section className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 md:p-8 border border-ui-border dark:border-dark-border">
                <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-brand" />
                  Marcos Importantes
                </h2>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10">
                          <CheckCircle2 className="h-5 w-5 text-brand" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-ui-text dark:text-dark-text">
                            {milestone.title}
                          </h3>
                          <span className="text-xs text-ui-muted dark:text-dark-muted">
                            {new Date(milestone.date).toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-ui-muted dark:text-dark-muted">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 border border-ui-border dark:border-dark-border">
              <h3 className="font-semibold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand" />
                Período
              </h3>
              <p className="text-ui-muted dark:text-dark-muted">
                {initiative.start_year}
                {initiative.end_year ? ` - ${initiative.end_year}` : ' - Atual'}
              </p>
            </div>

            {initiative.beneficiaries > 0 && (
              <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 border border-ui-border dark:border-dark-border">
                <h3 className="font-semibold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand" />
                  Beneficiários
                </h3>
                <p className="text-2xl font-bold text-brand">
                  {initiative.beneficiaries.toLocaleString()}
                </p>
                <p className="text-sm text-ui-muted dark:text-dark-muted">pessoas impactadas</p>
              </div>
            )}

            {initiative.locations.length > 0 && (
              <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 border border-ui-border dark:border-dark-border">
                <h3 className="font-semibold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand" />
                  Localizações
                </h3>
                <ul className="space-y-2">
                  {initiative.locations.map((location, index) => (
                    <li key={index} className="text-sm text-ui-muted dark:text-dark-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                      {location}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {initiative.ods_goals.length > 0 && (
              <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 border border-ui-border dark:border-dark-border">
                <h3 className="font-semibold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand" />
                  ODS da ONU
                </h3>
                <div className="flex flex-wrap gap-2">
                  {initiative.ods_goals.map((goal, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 rounded bg-brand/10 text-brand text-xs font-medium"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {initiative.partners.length > 0 && (
              <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 border border-ui-border dark:border-dark-border">
                <h3 className="font-semibold text-ui-text dark:text-dark-text mb-4 flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-brand" />
                  Parceiros
                </h3>
                <ul className="space-y-2">
                  {initiative.partners.map((partner, index) => (
                    <li key={index} className="text-sm text-ui-muted dark:text-dark-muted">
                      {partner}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <section className="bg-gradient-to-br from-[#8B5A3C] to-[#6B4423] text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Faça Parte Dessa Transformação
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Junte-se ao Instituto Manduvi e ajude a transformar vidas através de iniciativas que geram impacto real e duradouro.
          </p>
          <a
            href="https://manduvi.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#8B5A3C] px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Saiba Mais
          </a>
        </section>
      </div>
    </div>
  );
}
