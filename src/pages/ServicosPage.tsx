import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';

interface Service {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
}

export function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('slug, title, summary, category, tags')
      .eq('is_active', true)
      .order('title');

    if (data && !error) {
      setServices(data);
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !searchQuery ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-brand font-bold mb-2">serviços</h1>
          <p className="text-ui-muted dark:text-dark-muted">
            catálogo de serviços institucionais com assistência inteligente
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-muted dark:text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="buscar serviços..."
              className="w-full rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel py-3 pl-12 pr-4 text-ui-text placeholder:text-ui-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-ui-muted dark:text-dark-muted">categorias:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                  selectedCategory === null
                    ? 'bg-brand text-white'
                    : 'bg-ui-panel text-ui-muted hover:bg-ui-bg border border-ui-border dark:border-dark-border'
                }`}
              >
                todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-brand text-white'
                      : 'bg-ui-panel text-ui-muted hover:bg-ui-bg border border-ui-border dark:border-dark-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {filteredServices.length === 0 ? (
              <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-ui-muted dark:text-dark-muted mb-4" />
                <p className="text-ui-muted dark:text-dark-muted">Nenhum serviço encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.slug} service={service} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AdSlot format="mpu" />

            <div className="rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
              <h3 className="text-sm font-brand font-semibold mb-4">
                precisa de ajuda?
              </h3>
              <p className="text-sm text-ui-muted dark:text-dark-muted mb-4 leading-relaxed">
                Use o assistente inteligente para encontrar o serviço certo e preencher
                formulários de forma guiada.
              </p>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
              >
                falar com assistente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to={`/servico/${service.slug}`}
      className="group block rounded-lgx border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6 transition-all hover:border-brand hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <h3 className="text-lg font-brand font-semibold group-hover:text-brand">
          {service.title}
        </h3>
        <ArrowRight className="h-5 w-5 text-ui-muted transition-all group-hover:translate-x-1 group-hover:text-brand" />
      </div>

      <p className="mb-4 text-sm text-ui-muted leading-relaxed">{service.summary}</p>

      {service.tags && service.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {service.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-ui-bg px-2 py-1 text-xs text-ui-muted dark:text-dark-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
