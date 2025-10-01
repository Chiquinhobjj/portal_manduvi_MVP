import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { Calendar, MapPin, Building, DollarSign, ExternalLink, ArrowLeft, Clock, FileText } from 'lucide-react';

interface Edital {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  full_content: string | null;
  type: string;
  organization_name: string;
  organization_logo: string | null;
  cover_image: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  opening_date: string;
  closing_date: string;
  value_min: number | null;
  value_max: number | null;
  state: string | null;
  city: string | null;
  eligibility_criteria: string | null;
  submission_instructions: string | null;
  external_url: string | null;
}

export function EditalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [edital, setEdital] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchEdital();
    }
  }, [slug]);

  async function fetchEdital() {
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setEdital(data);
        await supabase.rpc('increment_edital_views', { edital_id: data.id });
      }
    } catch (error) {
      logger.error('Error fetching edital:', error);
    } finally {
      setLoading(false);
    }
  }

  function getDaysRemaining(): number {
    if (!edital) return 0;
    const today = new Date();
    const closing = new Date(edital.closing_date);
    const diffTime = closing.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando edital...</p>
        </div>
      </div>
    );
  }

  if (!edital) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-2">Edital não encontrado</h1>
          <button
            onClick={() => navigate('/editais')}
            className="text-brand hover:underline"
          >
            Voltar para editais
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      {edital.cover_image && (
        <div className="relative h-64 bg-gradient-to-br from-brand/20 to-brand-dark/20">
          <img
            src={edital.cover_image}
            alt={edital.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/editais')}
          className="inline-flex items-center gap-2 text-brand hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Central de Editais
        </button>

        <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {edital.organization_logo && (
              <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-white dark:bg-dark-bg shadow-sm p-2 border border-ui-border dark:border-dark-border">
                <img
                  src={edital.organization_logo}
                  alt={edital.organization_name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-ui-text dark:text-dark-text mb-2">
                {edital.title}
              </h1>
              {edital.subtitle && (
                <p className="text-lg text-ui-muted dark:text-dark-muted font-medium">
                  {edital.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-brand mt-0.5" />
              <div>
                <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Organização</div>
                <div className="text-ui-text dark:text-dark-text">{edital.organization_name}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-brand mt-0.5" />
              <div>
                <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Prazo</div>
                <div className="text-ui-text dark:text-dark-text">
                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Encerrado'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-brand mt-0.5" />
              <div>
                <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Data de Encerramento</div>
                <div className="text-ui-text dark:text-dark-text">
                  {new Date(edital.closing_date).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(edital.closing_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {(edital.city || edital.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Localização</div>
                  <div className="text-ui-text dark:text-dark-text">
                    {edital.city && edital.state ? `${edital.city}, ${edital.state}` : edital.city || edital.state}
                  </div>
                </div>
              </div>
            )}

            {(edital.value_min || edital.value_max) && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Valor</div>
                  <div className="text-ui-text dark:text-dark-text">
                    {edital.value_min && edital.value_max
                      ? `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(edital.value_min)} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(edital.value_max)}`
                      : edital.value_max
                      ? `Até ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(edital.value_max)}`
                      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(edital.value_min || 0)
                    }
                  </div>
                </div>
              </div>
            )}

            {edital.contact_email && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-ui-muted dark:text-dark-muted">Contato</div>
                  <a href={`mailto:${edital.contact_email}`} className="text-brand hover:underline">
                    {edital.contact_email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {daysRemaining > 0 && edital.external_url && (
            <a
              href={edital.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg transition-colors"
            >
              Acessar Edital Completo
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-4">Descrição</h2>
          <p className="text-ui-text dark:text-dark-text whitespace-pre-line leading-relaxed">
            {edital.full_content || edital.description}
          </p>
        </div>

        {edital.eligibility_criteria && (
          <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-4">Critérios de Elegibilidade</h2>
            <p className="text-ui-text dark:text-dark-text whitespace-pre-line leading-relaxed">
              {edital.eligibility_criteria}
            </p>
          </div>
        )}

        {edital.submission_instructions && (
          <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-4">Instruções de Submissão</h2>
            <p className="text-ui-text dark:text-dark-text whitespace-pre-line leading-relaxed">
              {edital.submission_instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
