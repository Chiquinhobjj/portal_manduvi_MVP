import { useEffect, useState } from 'react';
import { Heart, Lightbulb, Target, Sparkles, Users, Handshake, MapPin, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface Section {
  section_key: string;
  title: string;
  content: string;
  order_index: number;
}

interface Founder {
  name: string;
  role: string;
  description: string;
  image_url: string | null;
  order_index: number;
}

interface Value {
  title: string;
  description: string;
  icon_name: string | null;
  order_index: number;
}

interface Project {
  name: string;
  description: string;
  category: string;
  beneficiaries: number | null;
  start_year: number | null;
  end_year: number | null;
  status: string;
  order_index: number;
}

const iconMap: Record<string, any> = {
  heart: Heart,
  lightbulb: Lightbulb,
  target: Target,
  sparkles: Sparkles,
  users: Users,
  handshake: Handshake,
};

export function InstitutoPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [sectionsData, foundersData, valuesData, projectsData] = await Promise.all([
        supabase.from('instituto_sections').select('*').order('order_index'),
        supabase.from('instituto_founders').select('*').order('order_index'),
        supabase.from('instituto_values').select('*').order('order_index'),
        supabase.from('instituto_projects').select('*').order('order_index'),
      ]);

      if (sectionsData.data) setSections(sectionsData.data);
      if (foundersData.data) setFounders(foundersData.data);
      if (valuesData.data) setValues(valuesData.data);
      if (projectsData.data) setProjects(projectsData.data);
    } catch (error) {
      logger.error('Error fetching instituto data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getSectionContent(key: string): Section | undefined {
    return sections.find(s => s.section_key === key);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  const history = getSectionContent('history');
  const about = getSectionContent('about');
  const vision = getSectionContent('vision');
  const mission = getSectionContent('mission');

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#8B5A3C] to-[#6B4423] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Instituto Manduvi
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Inspirados na força da árvore Manduvi, promovendo transformação social através do esporte, educação e inovação
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      {history && (
        <section className="py-16 bg-ui-panel dark:bg-dark-panel">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-8">
              {history.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-ui-muted dark:text-dark-muted leading-relaxed">
                  {history.content}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-ui-bg dark:bg-dark-bg p-6 rounded-lg">
                  <div className="text-4xl font-bold text-brand mb-2">2004</div>
                  <div className="text-sm text-ui-muted dark:text-dark-muted">Fundação</div>
                </div>
                <div className="bg-ui-bg dark:bg-dark-bg p-6 rounded-lg">
                  <div className="text-4xl font-bold text-brand mb-2">20+</div>
                  <div className="text-sm text-ui-muted dark:text-dark-muted">Anos de História</div>
                </div>
                <div className="bg-ui-bg dark:bg-dark-bg p-6 rounded-lg">
                  <div className="text-4xl font-bold text-brand mb-2">50k+</div>
                  <div className="text-sm text-ui-muted dark:text-dark-muted">Vidas Impactadas</div>
                </div>
                <div className="bg-ui-bg dark:bg-dark-bg p-6 rounded-lg">
                  <div className="text-4xl font-bold text-brand mb-2">3</div>
                  <div className="text-sm text-ui-muted dark:text-dark-muted">Estados</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Founders Section */}
      {founders.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-12 text-center">
              Fundadores
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {founders.map((founder, index) => (
                <div
                  key={index}
                  className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-brand/20 to-brand/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-16 h-16 text-brand" />
                  </div>
                  <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2">
                    {founder.name}
                  </h3>
                  <p className="text-sm text-brand font-medium mb-2">{founder.role}</p>
                  {founder.description && (
                    <p className="text-sm text-ui-muted dark:text-dark-muted">{founder.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {about && (
        <section className="py-16 bg-ui-panel dark:bg-dark-panel">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-8">
              {about.title}
            </h2>
            <p className="text-lg text-ui-muted dark:text-dark-muted leading-relaxed max-w-4xl">
              {about.content}
            </p>
          </div>
        </section>
      )}

      {/* Pillars Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-12 text-center">
            Nossos Pilares
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 dark:from-teal-500/20 dark:to-teal-500/10 rounded-lg p-8">
              <Heart className="w-12 h-12 text-teal-600 dark:text-teal-400 mb-4" />
              <h3 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-3">Acolher</h3>
              <p className="text-ui-muted dark:text-dark-muted">
                Focado na diversidade, cria um ambiente inclusivo, oferecendo oportunidades de crescimento e empoderamento para todos.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-lg p-8">
              <Lightbulb className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-3">Inovar</h3>
              <p className="text-ui-muted dark:text-dark-muted">
                O instituto incentiva a inovação, buscando soluções que façam a diferença na vida das pessoas e promovam um futuro melhor.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10 rounded-lg p-8">
              <Target className="w-12 h-12 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-3">Impactar</h3>
              <p className="text-ui-muted dark:text-dark-muted">
                O instituto trabalha para gerar impacto social positivo, transformando sonhos em realidade com resultados duradouros e sustentáveis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="py-16 bg-ui-panel dark:bg-dark-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {vision && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-brand" />
                  <h2 className="text-2xl md:text-3xl font-bold text-ui-text dark:text-dark-text">
                    {vision.title}
                  </h2>
                </div>
                <p className="text-lg text-ui-muted dark:text-dark-muted leading-relaxed">
                  {vision.content}
                </p>
              </div>
            )}
            {mission && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-brand" />
                  <h2 className="text-2xl md:text-3xl font-bold text-ui-text dark:text-dark-text">
                    {mission.title}
                  </h2>
                </div>
                <p className="text-lg text-ui-muted dark:text-dark-muted leading-relaxed">
                  {mission.content}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      {values.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-12 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon_name ? iconMap[value.icon_name] || Sparkles : Sparkles;
                return (
                  <div
                    key={index}
                    className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <Icon className="w-8 h-8 text-brand mb-3" />
                    <h3 className="text-lg font-bold text-ui-text dark:text-dark-text mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-ui-muted dark:text-dark-muted">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="py-16 bg-ui-panel dark:bg-dark-panel">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-12 text-center">
              Nossos Projetos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-ui-bg dark:bg-dark-bg rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                      {project.category}
                    </span>
                    {project.status === 'active' && (
                      <span className="inline-block px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-ui-muted dark:text-dark-muted mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-ui-muted dark:text-dark-muted">
                    {project.beneficiaries && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.beneficiaries.toLocaleString()} beneficiários
                      </span>
                    )}
                    {project.start_year && (
                      <span>
                        {project.start_year}
                        {project.end_year ? ` - ${project.end_year}` : ' - atual'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-ui-text dark:text-dark-text mb-12 text-center">
            Onde Estamos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2">Brasil</h3>
              <p className="text-ui-muted dark:text-dark-muted">
                Mato Grosso, Rio de Janeiro e São Paulo
              </p>
            </div>
            <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2">Estados Unidos</h3>
              <p className="text-ui-muted dark:text-dark-muted">Alabama</p>
            </div>
            <div className="bg-ui-panel dark:bg-dark-panel rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 text-brand mx-auto mb-4" />
              <h3 className="text-xl font-bold text-ui-text dark:text-dark-text mb-2">China</h3>
              <p className="text-ui-muted dark:text-dark-muted">Xangai</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#8B5A3C] to-[#6B4423] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Faça Parte Dessa Transformação
          </h2>
          <p className="text-xl text-white/90 mb-8">
            O Instituto Manduvi tem por objetivo alimentar e manter viva as grandes ideias e, mais ainda, cultivá-las em um ambiente que valorize a inovação, o acolhimento à diversidade e o impacto positivo no potencial de cada comunidade, de cada indivíduo.
          </p>
          <a
            href="https://manduvi.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#8B5A3C] px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Saiba Mais
          </a>
        </div>
      </section>
    </div>
  );
}
