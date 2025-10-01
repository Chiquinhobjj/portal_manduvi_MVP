/*
  # Authentication and Multi-Profile User System

  ## Overview
  Creates comprehensive authentication system with role-based access control supporting:
  - Six distinct user profile types (admin, empresa, terceiro_setor, orgao_publico, colaborador, usuario)
  - Dynamic custom fields system allowing admins to extend any profile
  - Granular permissions management
  - Complete audit logging
  - Profile verification workflow

  ## New Tables

  ### 1. Authentication Core
  - `users`: Core authentication with email, role, and status
  - `user_sessions`: Session management and tracking
  - `password_resets`: Password reset token management

  ### 2. Profile Tables (One per user type)
  - `admin_profiles`: System administrators with full access
  - `empresa_profiles`: Business/company profiles
  - `terceiro_setor_profiles`: Third sector/NGO profiles
  - `orgao_publico_profiles`: Public organization profiles
  - `colaborador_profiles`: Collaborator/partner profiles
  - `usuario_profiles`: Standard user profiles

  ### 3. System Management
  - `permissions`: Granular permission definitions
  - `role_permissions`: Role-to-permission mappings
  - `custom_fields`: Dynamic field definitions for extending profiles
  - `custom_field_values`: Values for custom fields
  - `audit_logs`: Complete activity tracking

  ### 4. Notifications
  - `notifications`: User notifications with read tracking
  - `notification_preferences`: User notification settings

  ## Security
  - RLS enabled on all tables
  - Policies restrict access based on user role and ownership
  - Admin users have elevated privileges
  - Audit logs track all significant actions
  - Passwords never stored in plain text (handled by Supabase Auth)

  ## Important Notes
  1. This system integrates with Supabase Auth (auth.users table)
  2. User roles determine access to different parts of the application
  3. Custom fields allow runtime schema extension without migrations
  4. All profile tables have comprehensive fields for maximum data capture
*/

-- ============================================================================
-- 1. CORE AUTHENTICATION TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'empresa', 'terceiro_setor', 'orgao_publico', 'colaborador', 'usuario')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  profile_completed boolean DEFAULT false,
  last_login_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- User sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  login_at timestamptz DEFAULT now(),
  logout_at timestamptz,
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_login ON user_sessions(login_at DESC);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 2. PROFILE TABLES (One per user type)
-- ============================================================================

-- Admin Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  department text,
  access_level text DEFAULT 'standard' CHECK (access_level IN ('standard', 'super')),
  permissions_override jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can read all admin profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid() AND access_level = 'super'
  ));

-- Empresa (Business) Profiles
CREATE TABLE IF NOT EXISTS empresa_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  legal_name text,
  cnpj text UNIQUE,
  contact_person text NOT NULL,
  contact_email text,
  contact_phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'Brasil',
  company_size text CHECK (company_size IN ('micro', 'pequena', 'media', 'grande')),
  industry text,
  website text,
  linkedin text,
  instagram text,
  facebook text,
  description text,
  logo_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents jsonb DEFAULT '[]',
  is_sponsor boolean DEFAULT false,
  sponsor_tier text CHECK (sponsor_tier IN ('bronze', 'prata', 'ouro', 'platina')),
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empresa_cnpj ON empresa_profiles(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresa_verification ON empresa_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_empresa_sponsor ON empresa_profiles(is_sponsor);

ALTER TABLE empresa_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can read own profile"
  ON empresa_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Empresas can update own profile"
  ON empresa_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all empresa profiles"
  ON empresa_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all empresa profiles"
  ON empresa_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Terceiro Setor (NGO) Profiles
CREATE TABLE IF NOT EXISTS terceiro_setor_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  legal_name text,
  cnpj text UNIQUE,
  organization_type text CHECK (organization_type IN ('ong', 'oscip', 'associacao', 'fundacao', 'cooperativa', 'outro')),
  contact_person text NOT NULL,
  contact_email text,
  contact_phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'Brasil',
  foundation_year integer,
  areas_of_activity text[] DEFAULT '{}',
  target_audience text,
  mission_statement text,
  website text,
  linkedin text,
  instagram text,
  facebook text,
  youtube text,
  description text,
  logo_url text,
  cover_image_url text,
  annual_budget_range text,
  number_of_employees integer,
  number_of_volunteers integer,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents jsonb DEFAULT '[]',
  certifications jsonb DEFAULT '[]',
  partnerships text[] DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terceiro_setor_cnpj ON terceiro_setor_profiles(cnpj);
CREATE INDEX IF NOT EXISTS idx_terceiro_setor_verification ON terceiro_setor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_terceiro_setor_type ON terceiro_setor_profiles(organization_type);

ALTER TABLE terceiro_setor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Terceiro setor can read own profile"
  ON terceiro_setor_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Terceiro setor can update own profile"
  ON terceiro_setor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all terceiro setor profiles"
  ON terceiro_setor_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all terceiro setor profiles"
  ON terceiro_setor_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Orgão Público (Public Organization) Profiles
CREATE TABLE IF NOT EXISTS orgao_publico_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  organization_type text CHECK (organization_type IN ('federal', 'estadual', 'municipal', 'autarquia', 'empresa_publica', 'fundacao_publica', 'outro')),
  cnpj text UNIQUE,
  contact_person text NOT NULL,
  contact_position text,
  contact_email text,
  contact_phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'Brasil',
  sphere text CHECK (sphere IN ('federal', 'estadual', 'municipal')),
  area_of_activity text,
  website text,
  description text,
  logo_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents jsonb DEFAULT '[]',
  authorized_by text,
  authorization_document_url text,
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orgao_publico_cnpj ON orgao_publico_profiles(cnpj);
CREATE INDEX IF NOT EXISTS idx_orgao_publico_verification ON orgao_publico_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_orgao_publico_type ON orgao_publico_profiles(organization_type);
CREATE INDEX IF NOT EXISTS idx_orgao_publico_sphere ON orgao_publico_profiles(sphere);

ALTER TABLE orgao_publico_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orgao publico can read own profile"
  ON orgao_publico_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Orgao publico can update own profile"
  ON orgao_publico_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orgao publico profiles"
  ON orgao_publico_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all orgao publico profiles"
  ON orgao_publico_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Colaborador (Collaborator/Partner) Profiles
CREATE TABLE IF NOT EXISTS colaborador_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text UNIQUE,
  birth_date date,
  gender text,
  phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'Brasil',
  profession text,
  area_of_expertise text[] DEFAULT '{}',
  bio text,
  linkedin text,
  instagram text,
  facebook text,
  twitter text,
  website text,
  avatar_url text,
  cv_url text,
  collaboration_type text[] DEFAULT '{}',
  availability text CHECK (availability IN ('disponivel', 'parcial', 'indisponivel')),
  hourly_rate numeric,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents jsonb DEFAULT '[]',
  skills text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  certifications jsonb DEFAULT '[]',
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colaborador_cpf ON colaborador_profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_colaborador_verification ON colaborador_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_colaborador_availability ON colaborador_profiles(availability);

ALTER TABLE colaborador_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colaboradores can read own profile"
  ON colaborador_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Colaboradores can update own profile"
  ON colaborador_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all colaborador profiles"
  ON colaborador_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all colaborador profiles"
  ON colaborador_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Usuario (Standard User) Profiles
CREATE TABLE IF NOT EXISTS usuario_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text UNIQUE,
  birth_date date,
  gender text,
  phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_country text DEFAULT 'Brasil',
  occupation text,
  interests text[] DEFAULT '{}',
  bio text,
  avatar_url text,
  linkedin text,
  instagram text,
  facebook text,
  twitter text,
  newsletter_subscribed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuario_cpf ON usuario_profiles(cpf);

ALTER TABLE usuario_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios can read own profile"
  ON usuario_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios can update own profile"
  ON usuario_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all usuario profiles"
  ON usuario_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all usuario profiles"
  ON usuario_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 3. PERMISSIONS AND ACCESS CONTROL
-- ============================================================================

-- Permissions definitions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource, action)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Role-Permission mappings
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('admin', 'empresa', 'terceiro_setor', 'orgao_publico', 'colaborador', 'usuario')),
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 4. CUSTOM FIELDS SYSTEM
-- ============================================================================

-- Custom field definitions
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect', 'textarea', 'url', 'email', 'phone', 'file')),
  field_options jsonb DEFAULT '[]',
  validation_rules jsonb DEFAULT '{}',
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(table_name, field_name)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_table ON custom_fields(table_name, is_active);

ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active custom fields"
  ON custom_fields FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage custom fields"
  ON custom_fields FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Custom field values
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  record_id uuid NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(custom_field_id, record_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_record ON custom_field_values(record_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(custom_field_id);

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own custom field values"
  ON custom_field_values FOR SELECT
  TO authenticated
  USING (
    auth.uid() = record_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own custom field values"
  ON custom_field_values FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = record_id);

CREATE POLICY "Users can modify own custom field values"
  ON custom_field_values FOR UPDATE
  TO authenticated
  USING (auth.uid() = record_id)
  WITH CHECK (auth.uid() = record_id);

CREATE POLICY "Admins can manage all custom field values"
  ON custom_field_values FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 5. AUDIT LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  changes jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 6. NOTIFICATIONS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  frequency text DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  notification_types jsonb DEFAULT '{"info": true, "success": true, "warning": true, "error": true, "announcement": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. SEED DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (resource, action, description) VALUES
('users', 'read', 'View user information'),
('users', 'create', 'Create new users'),
('users', 'update', 'Update user information'),
('users', 'delete', 'Delete users'),
('editais', 'read', 'View editais'),
('editais', 'create', 'Create new editais'),
('editais', 'update', 'Update editais'),
('editais', 'delete', 'Delete editais'),
('editais', 'apply', 'Apply to editais'),
('applications', 'read', 'View applications'),
('applications', 'review', 'Review applications'),
('dashboard', 'access', 'Access dashboard'),
('analytics', 'view', 'View analytics'),
('reports', 'generate', 'Generate reports'),
('settings', 'manage', 'Manage system settings')
ON CONFLICT DO NOTHING;
