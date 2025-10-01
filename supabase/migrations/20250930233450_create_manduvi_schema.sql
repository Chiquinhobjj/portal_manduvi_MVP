/*
  # Manduvi OS - Schema Principal

  ## Visão Geral
  Este migration cria a estrutura de dados completa para o Manduvi OS, incluindo:
  - Sistema de notícias com fontes e artigos
  - Taxonomia de tópicos e entidades
  - Serviços institucionais
  - Datasets do observatório
  - Sistema de alertas e feedback
  - Gestão de publicidade

  ## Novas Tabelas

  ### 1. Sistema de Notícias
  - `sources`: fontes de notícias (veículos, RSS)
  - `articles`: artigos coletados e agregados
  - `topics`: taxonomia de temas (hierárquica)
  - `article_topics`: relação artigo-tópico com score
  - `entities`: organizações, pessoas, locais mencionados
  - `article_entities`: relação artigo-entidade com saliência
  - `briefs`: resumos gerados por IA de tópicos/períodos

  ### 2. Usuários e Preferências
  - `user_profiles`: perfis com interesses e regiões
  - `alerts`: assinaturas de alertas por tópico/região
  - `feedback`: feedback de usuários sobre conteúdo

  ### 3. Serviços Institucionais
  - `services`: catálogo de serviços públicos
  - `service_submissions`: formulários submetidos (stub)

  ### 4. Observatório de Dados
  - `datasets`: metadados de conjuntos de dados
  - `dataset_indicators`: indicadores específicos por dataset

  ### 5. Publicidade
  - `ad_placements`: banners e slots de anúncios
  - `sponsored_items`: conteúdo patrocinado com disclosure

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por padrão
  - Acesso público apenas para conteúdo indexável (SEO)
  - Policies separadas para leitura pública e escrita autenticada
*/

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. SISTEMA DE NOTÍCIAS
-- ============================================================================

-- Fontes de notícias
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('rss', 'scraper', 'api', 'manual')),
  region text NOT NULL DEFAULT 'MT',
  reliability_score int DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),
  rss_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_fetch_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sources are publicly readable"
  ON sources FOR SELECT
  TO public
  USING (true);

-- Artigos
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  lead text,
  body text,
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  published_at timestamptz NOT NULL,
  collected_at timestamptz DEFAULT now(),
  image_url text,
  hash text UNIQUE NOT NULL,
  is_opinion boolean DEFAULT false,
  lang text DEFAULT 'pt' CHECK (lang IN ('pt', 'en', 'es')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_hash ON articles(hash);
CREATE INDEX IF NOT EXISTS idx_articles_title_trgm ON articles USING gin(title gin_trgm_ops);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable"
  ON articles FOR SELECT
  TO public
  USING (true);

-- Tópicos (taxonomia hierárquica)
CREATE TABLE IF NOT EXISTS topics (
  slug text PRIMARY KEY,
  label text NOT NULL,
  taxonomy_path text NOT NULL,
  parent_slug text REFERENCES topics(slug) ON DELETE SET NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_slug);
CREATE INDEX IF NOT EXISTS idx_topics_path ON topics(taxonomy_path);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are publicly readable"
  ON topics FOR SELECT
  TO public
  USING (true);

-- Relação artigo-tópico com score de relevância
CREATE TABLE IF NOT EXISTS article_topics (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  topic_slug text REFERENCES topics(slug) ON DELETE CASCADE,
  score real DEFAULT 0.5 CHECK (score BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, topic_slug)
);

CREATE INDEX IF NOT EXISTS idx_article_topics_topic ON article_topics(topic_slug, score DESC);
CREATE INDEX IF NOT EXISTS idx_article_topics_article ON article_topics(article_id);

ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article topics are publicly readable"
  ON article_topics FOR SELECT
  TO public
  USING (true);

-- Entidades (organizações, pessoas, locais)
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('org', 'pessoa', 'local')),
  name text NOT NULL,
  norm_name text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_norm ON entities(norm_name);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entities are publicly readable"
  ON entities FOR SELECT
  TO public
  USING (true);

-- Relação artigo-entidade com saliência
CREATE TABLE IF NOT EXISTS article_entities (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES entities(id) ON DELETE CASCADE,
  salience real DEFAULT 0.5 CHECK (salience BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_article_entities_entity ON article_entities(entity_id, salience DESC);
CREATE INDEX IF NOT EXISTS idx_article_entities_article ON article_entities(article_id);

ALTER TABLE article_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article entities are publicly readable"
  ON article_entities FOR SELECT
  TO public
  USING (true);

-- Briefs (resumos gerados por IA)
CREATE TABLE IF NOT EXISTS briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_slug text REFERENCES topics(slug) ON DELETE SET NULL,
  query_fingerprint text,
  timespan text NOT NULL,
  summary_md text NOT NULL,
  sources jsonb DEFAULT '[]',
  region text DEFAULT 'MT',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_briefs_topic ON briefs(topic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_fingerprint ON briefs(query_fingerprint);

ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Briefs are publicly readable"
  ON briefs FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 2. USUÁRIOS E PREFERÊNCIAS
-- ============================================================================

-- Perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY,
  interests text[] DEFAULT '{}',
  regions text[] DEFAULT '{}',
  detail_level text DEFAULT 'standard' CHECK (detail_level IN ('express', 'standard', 'deep')),
  notify_prefs jsonb DEFAULT '{}',
  channels jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Alertas
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  topic_slug text REFERENCES topics(slug) ON DELETE CASCADE,
  query text,
  region text,
  urgency text DEFAULT 'all' CHECK (urgency IN ('all', 'urgent')),
  channel text DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp', 'push')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_topic ON alerts(topic_slug);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  target_type text NOT NULL CHECK (target_type IN ('article', 'brief', 'answer', 'service')),
  target_id text NOT NULL,
  signal text NOT NULL CHECK (signal IN ('thumbs_up', 'thumbs_down', 'irrelevant', 'outdated', 'biased', 'useful')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_target ON feedback(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. SERVIÇOS INSTITUCIONAIS
-- ============================================================================

-- Serviços
CREATE TABLE IF NOT EXISTS services (
  slug text PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  description text,
  steps jsonb DEFAULT '[]',
  faq jsonb DEFAULT '[]',
  owner_org text,
  category text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active services are publicly readable"
  ON services FOR SELECT
  TO public
  USING (is_active = true);

-- Submissões de formulários (stub)
CREATE TABLE IF NOT EXISTS service_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_slug text REFERENCES services(slug) ON DELETE CASCADE,
  user_id uuid,
  form_data jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_service ON service_submissions(service_slug);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON service_submissions(user_id);

ALTER TABLE service_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON service_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions"
  ON service_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. OBSERVATÓRIO DE DADOS
-- ============================================================================

-- Datasets
CREATE TABLE IF NOT EXISTS datasets (
  slug text PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  description text,
  schema jsonb DEFAULT '{}',
  source_url text,
  category text,
  region text DEFAULT 'MT',
  frequency text,
  last_updated timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);
CREATE INDEX IF NOT EXISTS idx_datasets_region ON datasets(region);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Datasets are publicly readable"
  ON datasets FOR SELECT
  TO public
  USING (true);

-- Indicadores de datasets
CREATE TABLE IF NOT EXISTS dataset_indicators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_slug text REFERENCES datasets(slug) ON DELETE CASCADE,
  indicator_key text NOT NULL,
  label text NOT NULL,
  value numeric,
  unit text,
  reference_date date,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicators_dataset ON dataset_indicators(dataset_slug, reference_date DESC);
CREATE INDEX IF NOT EXISTS idx_indicators_key ON dataset_indicators(indicator_key);

ALTER TABLE dataset_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dataset indicators are publicly readable"
  ON dataset_indicators FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 5. PUBLICIDADE
-- ============================================================================

-- Placements de anúncios
CREATE TABLE IF NOT EXISTS ad_placements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page text NOT NULL,
  position text NOT NULL CHECK (position IN ('leaderboard', 'mpu', 'halfpage', 'incontent')),
  format text NOT NULL,
  partner text,
  creative_url text,
  link_url text,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_placements_page ON ad_placements(page, is_active);
CREATE INDEX IF NOT EXISTS idx_ad_placements_dates ON ad_placements(start_at, end_at);

ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active ads are publicly readable"
  ON ad_placements FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
  );

-- Conteúdo patrocinado
CREATE TABLE IF NOT EXISTS sponsored_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  context text NOT NULL CHECK (context IN ('list', 'chat', 'search')),
  label text NOT NULL,
  description text,
  link text NOT NULL,
  disclosure_text text DEFAULT 'Patrocinado',
  weight int DEFAULT 1,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsored_context ON sponsored_items(context, is_active, weight DESC);

ALTER TABLE sponsored_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsored items are publicly readable"
  ON sponsored_items FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
  );
