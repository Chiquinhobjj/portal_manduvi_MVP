import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, Calendar, MapPin, Building, Star, Clock, ArrowRight } from 'lucide-react';
import { logger } from '../lib/logger';

interface Edital {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  type: string;
  organization_name: string;
  organization_logo: string | null;
  cover_image: string | null;
  closing_date: string;
  opening_date: string;
  value_max: number | null;
  state: string | null;
  city: string | null;
  status: string;
  featured: boolean;
}

export function EditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEditais();
  }, []);

  async function fetchEditais() {
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('closing_date', { ascending: true });

      if (error) throw error;
      setEditais(data || []);
    } catch (error) {
      logger.error('Error fetching editais:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEditais = editais.filter((edital) => {
    const matchesSearch =
      edital.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edital.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edital.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || edital.type === selectedType;
    return matchesSearch && matchesType;
  });

  const featuredEditais = filteredEditais.filter(e => e.featured);
  const regularEditais = filteredEditais.filter(e => !e.featured);

  const typeLabels: Record<string, string> = {
    licitacao: 'Licitação',
    pregao: 'Pregão',
    concurso: 'Concurso',
    chamamento: 'Chamamento',
    credenciamento: 'Credenciamento',
    financiamento: 'Financiamento',
    parceria: 'Parceria',
    selecao: 'Seleção Pública',
    outro: 'Outro',
  };

  function getDaysRemaining(closingDate: string): number {
    const today = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getStatusBadge(closingDate: string) {
    const daysRemaining = getDaysRemaining(closingDate);

    if (daysRemaining < 0) {
      return { text: 'INSCRIÇÕES ENCERRADAS', color: 'bg-red-500/10 text-red-600 dark:text-red-400' };
    } else if (daysRemaining <= 7) {
      return { text: 'ENCERRANDO EM BREVE', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' };
    } else {
      return { text: 'INSCRIÇÕES ABERTAS', color: 'bg-green-500/10 text-green-600 dark:text-green-400' };
    }
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="bg-gradient-to-br from-brand/10 via-transparent to-brand-dark/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
                Central de Editais
              </h1>
              <p className="text-lg text-ui-muted dark:text-dark-muted max-w-3xl">
                Explore oportunidades de financiamento, parcerias e seleções públicas
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
              <input
                type="text"
                placeholder="Buscar por título, organização ou palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {showFilters && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando editais...</p>
          </div>
        ) : filteredEditais.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-ui-muted/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-ui-muted" />
            </div>
            <h3 className="text-xl font-medium text-ui-text dark:text-dark-text mb-2">
              Nenhum edital encontrado
            </h3>
            <p className="text-ui-muted dark:text-dark-muted">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
          </div>
        ) : (
          <>
            {featuredEditais.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-brand" />
                  EDITAIS EM DESTAQUE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredEditais.map((edital) => (
                    <EditalCard key={edital.id} edital={edital} typeLabels={typeLabels} getStatusBadge={getStatusBadge} getDaysRemaining={getDaysRemaining} />
                  ))}
                </div>
              </div>
            )}

            {regularEditais.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-6">
                  ÚLTIMOS EDITAIS
                </h2>
                <div className="space-y-6">
                  {regularEditais.map((edital) => (
                    <EditalListItem key={edital.id} edital={edital} typeLabels={typeLabels} getStatusBadge={getStatusBadge} getDaysRemaining={getDaysRemaining} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EditalCard({ edital, typeLabels, getStatusBadge, getDaysRemaining }: any) {
  const statusBadge = getStatusBadge(edital.closing_date);
  const daysRemaining = getDaysRemaining(edital.closing_date);

  return (
    <Link
      to={`/editais/${edital.slug}`}
      className="group block rounded-lg overflow-hidden border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gradient-to-br from-brand/20 to-brand-dark/20 overflow-hidden">
        {edital.cover_image ? (
          <img
            src={edital.cover_image}
            alt={edital.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="h-16 w-16 text-brand/30" />
          </div>
        )}
        {edital.organization_logo && (
          <div className="absolute top-3 left-3 w-12 h-12 bg-white dark:bg-dark-panel rounded-lg shadow-md p-1.5">
            <img
              src={edital.organization_logo}
              alt={edital.organization_name}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        </div>
      </div>

      <div className="p-4">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand mb-2">
          {typeLabels[edital.type] || edital.type}
        </span>

        <h3 className="text-lg font-bold text-ui-text dark:text-dark-text mb-1 line-clamp-2 group-hover:text-brand transition-colors">
          {edital.title}
        </h3>

        <p className="text-sm text-ui-muted dark:text-dark-muted font-medium mb-3">
          {edital.subtitle || edital.organization_name}
        </p>

        <div className="space-y-2 mb-4">
          <div className="text-xs text-ui-muted dark:text-dark-muted">
            Status do Edital
          </div>
          <div className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${statusBadge.color}`}>
            {daysRemaining > 0 ? `ATÉ ${new Date(edital.closing_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ÀS ${new Date(edital.closing_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : statusBadge.text}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-brand font-medium group-hover:underline">
            Saiba mais
          </span>
          <ArrowRight className="h-4 w-4 text-brand group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function EditalListItem({ edital, typeLabels, getStatusBadge, getDaysRemaining }: any) {
  const statusBadge = getStatusBadge(edital.closing_date);
  const daysRemaining = getDaysRemaining(edital.closing_date);

  return (
    <Link
      to={`/editais/${edital.slug}`}
      className="group block rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel hover:border-brand hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            {edital.organization_logo ? (
              <div className="w-20 h-20 rounded-lg bg-white dark:bg-dark-bg shadow-sm p-2 border border-ui-border dark:border-dark-border">
                <img
                  src={edital.organization_logo}
                  alt={edital.organization_name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-brand/10 flex items-center justify-center">
                <Building className="h-10 w-10 text-brand" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-1 group-hover:text-brand transition-colors">
                  {edital.title}
                </h3>
                <p className="text-sm text-ui-muted dark:text-dark-muted font-medium">
                  {edital.subtitle || edital.organization_name}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-ui-muted dark:text-dark-muted group-hover:text-brand group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                {typeLabels[edital.type] || edital.type}
              </span>
              <div className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${statusBadge.color}`}>
                {statusBadge.text}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-ui-muted dark:text-dark-muted">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {daysRemaining > 0
                    ? `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} restantes`
                    : 'Encerrado'
                  }
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  ATÉ {new Date(edital.closing_date).toLocaleDateString('pt-BR')} ÀS {new Date(edital.closing_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {edital.city && edital.state && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{edital.city}, {edital.state}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
