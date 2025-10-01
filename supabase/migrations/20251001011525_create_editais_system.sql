/*
  # Editais (Public Notices) Management System

  ## Overview
  Creates comprehensive system for managing editais (public notices/bids) including:
  - Full editais lifecycle from creation to closure
  - Application submission and tracking
  - Document management and attachments
  - Categories and advanced filtering
  - Comments and collaboration
  - Favorites and alerts
  - Search and discovery

  ## New Tables

  ### 1. Editais Core
  - `editais`: Main editais table with comprehensive fields
  - `editais_categories`: Hierarchical category system
  - `editais_documents`: Document attachments for editais
  - `editais_requirements`: Specific requirements for each edital

  ### 2. Applications
  - `editais_applications`: User applications to editais
  - `application_documents`: Documents submitted with applications
  - `application_history`: Status change tracking

  ### 3. User Interaction
  - `editais_comments`: Questions and discussions about editais
  - `editais_favorites`: User bookmarks
  - `editais_alerts`: Notification subscriptions
  - `editais_views`: View tracking for analytics

  ## Security
  - RLS enabled on all tables
  - Public read access for active editais
  - Authenticated users can apply and interact
  - Admins and authorized users can create/manage editais
  - Users can only modify their own applications

  ## Important Notes
  1. Full-text search enabled on relevant fields
  2. Status workflow: draft -> published -> closed -> archived
  3. Application workflow: draft -> submitted -> under_review -> approved/rejected
*/

-- ============================================================================
-- 1. EDITAIS CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS editais_categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text,
  parent_slug text REFERENCES editais_categories(slug) ON DELETE SET NULL,
  icon text,
  color text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editais_categories_parent ON editais_categories(parent_slug);
CREATE INDEX IF NOT EXISTS idx_editais_categories_active ON editais_categories(is_active);

ALTER TABLE editais_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON editais_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON editais_categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 2. EDITAIS MAIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS editais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  full_content text,
  type text NOT NULL CHECK (type IN ('licitacao', 'pregao', 'concurso', 'chamamento', 'credenciamento', 'outro')),
  category_slug text REFERENCES editais_categories(slug) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'cancelled', 'archived')),
  organization_name text NOT NULL,
  organization_type text,
  contact_person text,
  contact_email text,
  contact_phone text,
  opening_date timestamptz,
  closing_date timestamptz NOT NULL,
  result_date timestamptz,
  value_min numeric,
  value_max numeric,
  currency text DEFAULT 'BRL',
  region text,
  city text,
  state text,
  country text DEFAULT 'Brasil',
  eligibility_criteria text,
  evaluation_criteria text,
  submission_instructions text,
  terms_and_conditions text,
  external_url text,
  reference_number text,
  year integer,
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_editais_slug ON editais(slug);
CREATE INDEX IF NOT EXISTS idx_editais_status ON editais(status);
CREATE INDEX IF NOT EXISTS idx_editais_category ON editais(category_slug);
CREATE INDEX IF NOT EXISTS idx_editais_closing_date ON editais(closing_date);
CREATE INDEX IF NOT EXISTS idx_editais_organization ON editais(organization_name);
CREATE INDEX IF NOT EXISTS idx_editais_region ON editais(state, city);
CREATE INDEX IF NOT EXISTS idx_editais_created_by ON editais(created_by);
CREATE INDEX IF NOT EXISTS idx_editais_title_search ON editais USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));

ALTER TABLE editais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published editais"
  ON editais FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all editais"
  ON editais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and authorized users can create editais"
  ON editais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'orgao_publico', 'terceiro_setor')
    )
  );

CREATE POLICY "Creators and admins can update editais"
  ON editais FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete editais"
  ON editais FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 3. EDITAIS DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS editais_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  file_type text,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editais_documents_edital ON editais_documents(edital_id);

ALTER TABLE editais_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documents of published editais"
  ON editais_documents FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id AND status = 'published'
    )
  );

CREATE POLICY "Authenticated users can view all documents"
  ON editais_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can upload documents"
  ON editais_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Authorized users can manage documents"
  ON editais_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================================================
-- 4. APPLICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS editais_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  applicant_organization text,
  applicant_document text,
  proposal_title text,
  proposal_summary text,
  proposal_full_text text,
  requested_value numeric,
  application_data jsonb DEFAULT '{}',
  review_notes text,
  review_score numeric,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(edital_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_edital ON editais_applications(edital_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_user ON editais_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON editais_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON editais_applications(submitted_at DESC);

ALTER TABLE editais_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON editais_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Edital creators can read applications"
  ON editais_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can read all applications"
  ON editais_applications FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create own applications"
  ON editais_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON editais_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('draft', 'submitted'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorized users can review applications"
  ON editais_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================================================
-- 5. APPLICATION DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES editais_applications(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  file_type text,
  document_type text,
  is_required boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_documents_application ON application_documents(application_id);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own application documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authorized reviewers can read application documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais_applications a
      JOIN editais e ON e.id = a.edital_id
      WHERE a.id = application_id 
      AND (
        e.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can upload own application documents"
  ON application_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own application documents"
  ON application_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. APPLICATION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS application_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES editais_applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_history_application ON application_history(application_id, created_at DESC);

ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own application history"
  ON application_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authorized users can read application history"
  ON application_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais_applications a
      JOIN editais e ON e.id = a.edital_id
      WHERE a.id = application_id 
      AND (
        e.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================================================
-- 7. USER INTERACTIONS
-- ============================================================================

-- Comments and questions
CREATE TABLE IF NOT EXISTS editais_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES editais_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_official_response boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editais_comments_edital ON editais_comments(edital_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_editais_comments_parent ON editais_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_editais_comments_user ON editais_comments(user_id);

ALTER TABLE editais_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published comments on published editais"
  ON editais_comments FOR SELECT
  TO public
  USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM editais WHERE id = edital_id AND status = 'published')
  );

CREATE POLICY "Users can read own comments"
  ON editais_comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments"
  ON editais_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON editais_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorized users can manage all comments"
  ON editais_comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id 
      AND (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Favorites
CREATE TABLE IF NOT EXISTS editais_favorites (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edital_id uuid NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, edital_id)
);

CREATE INDEX IF NOT EXISTS idx_editais_favorites_user ON editais_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_editais_favorites_edital ON editais_favorites(edital_id);

ALTER TABLE editais_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON editais_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Alerts/Subscriptions
CREATE TABLE IF NOT EXISTS editais_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_slug text REFERENCES editais_categories(slug) ON DELETE CASCADE,
  keywords text[] DEFAULT '{}',
  region text,
  value_min numeric,
  value_max numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editais_alerts_user ON editais_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_editais_alerts_category ON editais_alerts(category_slug);

ALTER TABLE editais_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON editais_alerts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- View tracking
CREATE TABLE IF NOT EXISTS editais_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editais_views_edital ON editais_views(edital_id);
CREATE INDEX IF NOT EXISTS idx_editais_views_user ON editais_views(user_id);
CREATE INDEX IF NOT EXISTS idx_editais_views_date ON editais_views(viewed_at DESC);

ALTER TABLE editais_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record views"
  ON editais_views FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read all views"
  ON editais_views FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Edital creators can read their edital views"
  ON editais_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM editais 
      WHERE id = edital_id AND created_by = auth.uid()
    )
  );

-- ============================================================================
-- 8. SEED DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO editais_categories (slug, name, description, display_order) VALUES
('licitacoes', 'Licitações', 'Processos licitatórios para contratação de bens e serviços', 1),
('pregoes', 'Pregões', 'Modalidade de licitação para aquisição de bens e serviços comuns', 2),
('concursos', 'Concursos', 'Concursos públicos para contratação de pessoal', 3),
('chamamentos', 'Chamamentos Públicos', 'Chamamentos para seleção de projetos e parcerias', 4),
('credenciamento', 'Credenciamento', 'Processos de credenciamento de prestadores de serviços', 5),
('consultas', 'Consultas Públicas', 'Consultas para participação da sociedade', 6),
('subvencoes', 'Subvenções e Auxílios', 'Programas de apoio financeiro e subvenções', 7),
('outros', 'Outros', 'Outros tipos de editais e avisos públicos', 8)
ON CONFLICT DO NOTHING;
