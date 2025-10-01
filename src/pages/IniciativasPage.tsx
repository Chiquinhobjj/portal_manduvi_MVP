import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface Initiative {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  status: string;
  beneficiaries: number;
  start_year: number | null;
  end_year: number | null;
  featured: boolean;
  locations: string[];
  ods_goals: string[];
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Esporte': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  'Educação': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
  'Saúde': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
  'Assistência Social': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
  'Tecnologia': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  'Inclusão': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
  'Institucional': { bg: 'bg-[#603813]/10', text: 'text-[#603813] dark:text-[#854224]', border: 'border-[#603813]/20' },
};

export function IniciativasPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchInitiatives();
  }, []);

  useEffect(() => {
    filterInitiatives();
  }, [selectedCategory, selectedStatus, initiatives]);

  async function fetchInitiatives() {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error: supabaseError } = await supabase
        .from('initiatives')
        .select('*')
        .order('order_index');

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Erro do banco de dados: ${supabaseError.message}`);
      }

      if (data) {
        setInitiatives(data);
        console.log('Initiatives loaded:', data.length);
      } else {
        setInitiatives([]);
        console.log('No initiatives found');
      }
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      logger.error('Error fetching initiatives:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar iniciativas. Tente novamente.');
      setInitiatives([]);
    } finally {
      setLoading(false);
    }
  }

  function filterInitiatives() {
    let filtered = [...initiatives];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(i => i.status === selectedStatus);
    }

    setFilteredInitiatives(filtered);
  }

  const categories = Array.from(new Set(initiatives.map(i => i.category)));
  const featuredInitiatives = initiatives.filter(i => i.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-ui-muted dark:text-dark-muted">Carregando iniciativas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-[#8B5A3C] to-[#6B4423] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl sm:text-5xl font-brand font-bold mb-4">iniciativas</h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Conheça as iniciativas que transformam vidas através do esporte, educação, saúde e inovação social
            </p>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchInitiatives}
                className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#8B5A3C] to-[#6B4423] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-brand font-bold mb-4">iniciativas</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Conheça as iniciativas que transformam vidas através do esporte, educação, saúde e inovação social
          </p>
        </div>
      </div>

      {featuredInitiatives.length > 0 && (
        <section className="bg-ui-panel dark:bg-dark-panel border-b border-ui-border dark:border-dark-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-6">
              Iniciativas em Destaque
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredInitiatives.map((initiative) => (
                <InitiativeCard key={initiative.slug} initiative={initiative} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <h3 className="text-lg font-semibold text-ui-text dark:text-dark-text">Filtros</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-ui-muted dark:text-dark-muted mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel px-4 py-2 text-sm text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-muted dark:text-dark-muted mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel px-4 py-2 text-sm text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="completed">Concluídos</option>
                <option value="planned">Planejados</option>
              </select>
            </div>
          </div>
        </div>

        {filteredInitiatives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ui-muted dark:text-dark-muted">
              Nenhuma iniciativa encontrada com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInitiatives.map((initiative) => (
              <InitiativeCard key={initiative.slug} initiative={initiative} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InitiativeCard({
  initiative,
  featured = false,
}: {
  initiative: Initiative;
  featured?: boolean;
}) {
  const categoryStyle = categoryColors[initiative.category] || categoryColors['Institucional'];

  return (
    <Link
      to={`/iniciativas/${initiative.slug}`}
      className={`group block rounded-lg border ${categoryStyle.border} bg-ui-panel dark:bg-dark-panel p-6 transition-all hover:shadow-lg hover:scale-105 ${
        featured ? 'border-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
          {initiative.category}
        </span>
        {initiative.status === 'active' && (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
            Ativo
          </span>
        )}
        {initiative.status === 'completed' && (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
            Concluído
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2 group-hover:text-brand transition-colors">
        {initiative.name}
      </h3>

      <p className="text-sm text-ui-muted dark:text-dark-muted mb-4 line-clamp-2">
        {initiative.tagline}
      </p>

      <div className="space-y-2 mb-4">
        {initiative.beneficiaries > 0 && (
          <div className="flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
            <Users className="h-4 w-4" />
            <span>{initiative.beneficiaries.toLocaleString()} beneficiários</span>
          </div>
        )}

        {initiative.start_year && (
          <div className="flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
            <Calendar className="h-4 w-4" />
            <span>
              {initiative.start_year}
              {initiative.end_year ? ` - ${initiative.end_year}` : ' - Atual'}
            </span>
          </div>
        )}

        {initiative.locations.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-ui-muted dark:text-dark-muted">
            <MapPin className="h-4 w-4" />
            <span>{initiative.locations[0]}{initiative.locations.length > 1 && ` +${initiative.locations.length - 1}`}</span>
          </div>
        )}
      </div>

      {initiative.ods_goals.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {initiative.ods_goals.slice(0, 3).map((goal, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 rounded bg-brand/10 text-brand text-xs"
            >
              {goal}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-brand group-hover:gap-3 transition-all">
        Saiba mais
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
