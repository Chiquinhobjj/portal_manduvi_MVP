/*
  # Banner Carousel and Site Configuration System

  ## Overview
  This migration creates a comprehensive content management system for banners, site configuration, 
  media library, and admin activity tracking.

  ## 1. New Tables

  ### `banners`
  - `id` (uuid, primary key)
  - `title` (text) - Banner title for admin reference
  - `image_url` (text) - URL to banner image
  - `link_url` (text, nullable) - Optional link destination
  - `description` (text, nullable) - Optional description
  - `display_order` (integer) - Order in carousel (lower numbers first)
  - `is_active` (boolean) - Whether banner is currently displayed
  - `start_date` (timestamptz, nullable) - Optional scheduled start date
  - `end_date` (timestamptz, nullable) - Optional scheduled end date
  - `click_count` (integer) - Track banner clicks
  - `impression_count` (integer) - Track banner views
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `created_by` (uuid, foreign key to users)

  ### `site_settings`
  - `id` (uuid, primary key)
  - `setting_key` (text, unique) - Unique identifier for setting
  - `setting_value` (jsonb) - Flexible JSON storage for any setting value
  - `setting_type` (text) - Type hint (string, number, boolean, object, array)
  - `description` (text, nullable) - Human-readable description
  - `is_public` (boolean) - Whether setting is visible to public
  - `updated_at` (timestamptz)
  - `updated_by` (uuid, foreign key to users)

  ### `content_sections`
  - `id` (uuid, primary key)
  - `page_slug` (text) - Page identifier (homepage, about, services, etc)
  - `section_key` (text) - Section identifier within page
  - `content` (jsonb) - Rich content including text, images, layout
  - `display_order` (integer) - Order on page
  - `is_published` (boolean) - Whether section is live
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `updated_by` (uuid, foreign key to users)

  ### `media_library`
  - `id` (uuid, primary key)
  - `file_name` (text) - Original filename
  - `file_url` (text) - Storage URL
  - `file_type` (text) - MIME type
  - `file_size` (integer) - Size in bytes
  - `width` (integer, nullable) - Image width if applicable
  - `height` (integer, nullable) - Image height if applicable
  - `folder` (text) - Organization folder
  - `tags` (text[]) - Search tags
  - `alt_text` (text, nullable) - Accessibility text
  - `uploaded_at` (timestamptz)
  - `uploaded_by` (uuid, foreign key to users)

  ### `admin_activity_log`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to users)
  - `action` (text) - Action performed (create, update, delete)
  - `entity_type` (text) - Type of entity affected
  - `entity_id` (uuid, nullable) - ID of affected entity
  - `changes` (jsonb, nullable) - Details of changes made
  - `ip_address` (text, nullable) - Request IP
  - `created_at` (timestamptz)

  ### `banner_analytics`
  - `id` (uuid, primary key)
  - `banner_id` (uuid, foreign key to banners)
  - `event_type` (text) - 'impression' or 'click'
  - `user_id` (uuid, nullable) - User if authenticated
  - `session_id` (text) - Anonymous session tracking
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Admins can perform all operations
  - Public users can only read active/published content
  - Analytics tracking is insert-only for all users

  ## 3. Indexes
  - Index on banner display_order and is_active for efficient queries
  - Index on site_settings.setting_key for fast lookups
  - Index on content_sections (page_slug, display_order) for page rendering
  - Index on media_library.folder and tags for search
  - Index on admin_activity_log (user_id, created_at) for audit trails
  - Index on banner_analytics (banner_id, event_type, created_at) for reporting
*/

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  click_count integer DEFAULT 0,
  impression_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'string',
  description text,
  is_public boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id),
  UNIQUE(page_slug, section_key)
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  width integer,
  height integer,
  folder text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  alt_text text,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id)
);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create banner_analytics table
CREATE TABLE IF NOT EXISTS banner_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES banners(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_id uuid REFERENCES users(id),
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page_slug, display_order);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_admin_activity_user ON admin_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner ON banner_analytics(banner_id, event_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_analytics ENABLE ROW LEVEL SECURITY;

-- Banners policies
CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Admins can manage all banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Site settings policies
CREATE POLICY "Public can view public settings"
  ON site_settings FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Admins can view all settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Content sections policies
CREATE POLICY "Public can view published content"
  ON content_sections FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Admins can view all content"
  ON content_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage content"
  ON content_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Media library policies
CREATE POLICY "Authenticated users can view media"
  ON media_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage media"
  ON media_library FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin activity log policies
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Banner analytics policies
CREATE POLICY "Anyone can track banner analytics"
  ON banner_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view banner analytics"
  ON banner_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES 
  ('site_name', '"Manduvi OS"', 'string', 'Nome do site', true),
  ('site_tagline', '"Portal institucional do ecossistema de impacto do Brasil Central"', 'string', 'Slogan do site', true),
  ('carousel_auto_rotate', 'true', 'boolean', 'Rotação automática do carrossel de banners', false),
  ('carousel_rotation_interval', '5000', 'number', 'Intervalo de rotação em milissegundos', false),
  ('carousel_show_navigation', 'true', 'boolean', 'Mostrar controles de navegação', false),
  ('carousel_show_indicators', 'true', 'boolean', 'Mostrar indicadores de posição', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample banners
INSERT INTO banners (title, image_url, link_url, description, display_order, is_active)
VALUES 
  ('Banner 1', 'https://via.placeholder.com/100x100/603813/FFFFFF?text=Banner+1', '/parceiros', 'Primeiro banner do carrossel', 1, true),
  ('Banner 2', 'https://via.placeholder.com/100x100/854224/FFFFFF?text=Banner+2', '/iniciativas', 'Segundo banner do carrossel', 2, true),
  ('Banner 3', 'https://via.placeholder.com/100x100/902121/FFFFFF?text=Banner+3', '/editais', 'Terceiro banner do carrossel', 3, true),
  ('Banner 4', 'https://via.placeholder.com/100x100/603813/FFFFFF?text=Banner+4', '/dados', 'Quarto banner do carrossel', 4, true)
ON CONFLICT DO NOTHING;
