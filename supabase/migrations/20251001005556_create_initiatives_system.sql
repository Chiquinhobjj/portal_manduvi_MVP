-- Create Initiatives System for Instituto Manduvi
-- This migration creates a comprehensive initiatives catalog system

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  slug text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  long_description text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  beneficiaries integer DEFAULT 0,
  start_year integer,
  end_year integer,
  featured boolean DEFAULT false,
  image_url text,
  ods_goals text[] DEFAULT '{}',
  locations text[] DEFAULT '{}',
  partners text[] DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'planned'))
);

ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view initiatives"
  ON initiatives FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert initiatives"
  ON initiatives FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update initiatives"
  ON initiatives FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create initiative_impacts table
CREATE TABLE IF NOT EXISTS initiative_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_slug text NOT NULL REFERENCES initiatives(slug) ON DELETE CASCADE,
  metric text NOT NULL,
  value numeric NOT NULL,
  unit text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE initiative_impacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view initiative impacts"
  ON initiative_impacts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert initiative impacts"
  ON initiative_impacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update initiative impacts"
  ON initiative_impacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create initiative_milestones table
CREATE TABLE IF NOT EXISTS initiative_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_slug text NOT NULL REFERENCES initiatives(slug) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE initiative_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view initiative milestones"
  ON initiative_milestones FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert initiative milestones"
  ON initiative_milestones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update initiative milestones"
  ON initiative_milestones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed data with Instituto Manduvi initiatives
INSERT INTO initiatives (slug, name, tagline, description, long_description, category, status, beneficiaries, start_year, end_year, featured, ods_goals, locations, order_index) VALUES
('instituto-manduvi', 'Instituto Manduvi', 'Transformação social através do esporte, educação e inovação', 'O Instituto Manduvi nasce inspirado na força da árvore Manduvi, símbolo de força e resiliência e nativa do Pantanal, promovendo ideias sustentáveis e transformadoras.', 'O Instituto Manduvi, fundado em 2004 em Cuiabá, promove assistência social, educação, cultura, esporte, e geração de renda, com foco em crianças e adolescentes em vulnerabilidade social. Somos uma SocialTech que desenvolve soluções sustentáveis com impacto imediato e duradouro.', 'Institucional', 'active', 50000, 2004, NULL, true, ARRAY['ODS-1', 'ODS-4', 'ODS-10'], ARRAY['Mato Grosso', 'Rio de Janeiro', 'São Paulo', 'Alabama', 'Xangai'], 1),

('lutar-contra-fome', 'Lutar Contra a Fome', 'Segurança alimentar e nutricional sustentável', 'Projeto alinhado ao ODS-2 da ONU, visando erradicar a fome e promover segurança alimentar e nutrição sustentável para comunidades carentes.', 'Iniciativa que combate a insegurança alimentar através de distribuição de alimentos, hortas comunitárias e educação nutricional. Durante a pandemia, o projeto se destacou com doações essenciais para famílias em situação de vulnerabilidade.', 'Assistência Social', 'active', 5000, 2020, NULL, true, ARRAY['ODS-2', 'ODS-3'], ARRAY['Mato Grosso'], 2),

('esporte-que-acolhe', 'Esporte que Acolhe', 'Inclusão social através das artes marciais', 'Promove inclusão social e desenvolvimento humano através das artes marciais, expandindo seu alcance para todas as idades.', 'Programa que utiliza o esporte como ferramenta de transformação social, oferecendo aulas gratuitas de jiu-jitsu e outras modalidades para crianças, jovens e adultos em comunidades carentes.', 'Esporte', 'active', 20000, 2021, NULL, true, ARRAY['ODS-3', 'ODS-4', 'ODS-10'], ARRAY['Mato Grosso', 'Rio de Janeiro'], 3),

('jiujitsu-apae', 'Jiu-Jitsu Para Todos - APAE', 'Integração através das artes marciais', 'Iniciativa inovadora que integrou o jiu-jitsu nas atividades esportivas anuais para pessoas com deficiência.', 'Projeto pioneiro que demonstrou como o jiu-jitsu pode ser adaptado para pessoas com deficiência, promovendo inclusão, autoestima e desenvolvimento motor. Foi um marco na história do instituto.', 'Inclusão', 'completed', 150000, 2006, 2016, true, ARRAY['ODS-3', 'ODS-10'], ARRAY['Mato Grosso'], 4),

('lutar-pela-educacao', 'Lutar pela Educação', 'Acesso à educação de qualidade', 'Garantiu bolsas de estudo para mais de 100 crianças e jovens em instituições de ensino, promovendo acesso à educação de qualidade.', 'Programa que ofereceu suporte educacional completo, incluindo bolsas de estudo, material escolar e acompanhamento pedagógico para estudantes em situação de vulnerabilidade social.', 'Educação', 'completed', 100, 2006, 2020, false, ARRAY['ODS-4'], ARRAY['Mato Grosso'], 5),

('ser-mais-saudavel', 'Ser + Saudável', 'Saúde física e mental para todos', 'Promove saúde física e mental em comunidades carentes através de atividades físicas diversificadas e gratuitas.', 'Iniciativa que oferece diversas modalidades de atividades físicas, acompanhamento de profissionais de saúde e educação sobre hábitos saudáveis para comunidades em situação de vulnerabilidade.', 'Saúde', 'active', 15000, 2022, NULL, true, ARRAY['ODS-3'], ARRAY['Mato Grosso'], 6),

('manduvi-araras-team', 'Manduvi Araras Team', 'Formação de atletas de alto rendimento', 'Formação de atletas de alto rendimento em esportes olímpicos, especialmente wrestling.', 'Projeto dedicado ao desenvolvimento de atletas de elite, com foco especial em wrestling. O programa oferece treinamento de alto nível, suporte nutricional e psicológico, e prepara atletas para competições nacionais e internacionais.', 'Esporte', 'completed', 60, 2014, 2023, false, ARRAY['ODS-3', 'ODS-4'], ARRAY['Mato Grosso'], 7),

('programa-meu-futuro', 'Programa Meu Futuro', 'Capacitação profissional com tecnologia', 'Capacitação e qualificação profissional utilizando microlearning e inteligência artificial.', 'Programa inovador que utiliza tecnologia de ponta para oferecer capacitação profissional personalizada, preparando jovens e adultos para o mercado de trabalho através de cursos adaptativos e mentoria.', 'Educação', 'active', 3000, 2023, NULL, true, ARRAY['ODS-4', 'ODS-8', 'ODS-9'], ARRAY['Mato Grosso', 'Rio de Janeiro', 'São Paulo'], 8),

('coloiado-saude', 'Coloiado Saúde, Esporte e Lazer', 'Tecnologia e ciência para bem-estar', 'Iniciativa pioneira que entrelaça tecnologia e ciência para estimular conexões estratégicas em saúde, esporte e lazer.', 'Projeto que integra diferentes áreas do conhecimento para criar soluções inovadoras em saúde preventiva, atividade física e qualidade de vida, utilizando tecnologia para ampliar o alcance e efetividade das ações.', 'Tecnologia', 'active', 10000, 2023, NULL, true, ARRAY['ODS-3', 'ODS-9', 'ODS-11'], ARRAY['Mato Grosso'], 9)
ON CONFLICT (slug) DO NOTHING;

-- Seed impact metrics
INSERT INTO initiative_impacts (initiative_slug, metric, value, unit, order_index) VALUES
('instituto-manduvi', 'Vidas Impactadas', 50000, 'pessoas', 1),
('instituto-manduvi', 'Anos de História', 20, 'anos', 2),
('instituto-manduvi', 'Estados', 3, 'estados', 3),
('lutar-contra-fome', 'Famílias Atendidas', 5000, 'famílias', 1),
('lutar-contra-fome', 'Toneladas de Alimentos', 120, 'toneladas', 2),
('esporte-que-acolhe', 'Beneficiários', 20000, 'pessoas', 1),
('esporte-que-acolhe', 'Aulas por Semana', 50, 'aulas', 2),
('jiujitsu-apae', 'Participantes', 150000, 'pessoas', 1),
('ser-mais-saudavel', 'Pessoas Atendidas', 15000, 'pessoas', 1),
('programa-meu-futuro', 'Alunos Capacitados', 3000, 'alunos', 1),
('programa-meu-futuro', 'Taxa de Empregabilidade', 75, '%', 2)
ON CONFLICT DO NOTHING;

-- Seed key milestones
INSERT INTO initiative_milestones (initiative_slug, title, description, date, order_index) VALUES
('instituto-manduvi', 'Fundação do Instituto', 'Instituto Manduvi é oficialmente fundado em Cuiabá, Mato Grosso', '2004-01-01', 1),
('instituto-manduvi', 'Expansão para Rio de Janeiro', 'Instituto expande operações para o Rio de Janeiro', '2015-06-01', 2),
('instituto-manduvi', 'Parceria Internacional', 'Estabelecimento de parceria com organizações nos Estados Unidos', '2018-09-01', 3),
('jiujitsu-apae', 'Lançamento do Projeto', 'Início das atividades de jiu-jitsu com a APAE', '2006-03-01', 1),
('jiujitsu-apae', 'Reconhecimento Nacional', 'Projeto recebe reconhecimento nacional como iniciativa inovadora', '2010-08-01', 2),
('programa-meu-futuro', 'Lançamento do Programa', 'Início do programa de capacitação profissional com IA', '2023-01-15', 1),
('programa-meu-futuro', 'Primeira Turma Formada', 'Primeira turma conclui capacitação com 80% de aproveitamento', '2023-06-30', 2)
ON CONFLICT DO NOTHING;