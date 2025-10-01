/*
  # Adicionar Campos de Imagens e Atualizar Tipos de Editais

  ## Descrição
  Esta migração adiciona campos para armazenar URLs de imagens e expande os tipos
  de editais permitidos no sistema.

  ## Alterações nas Tabelas

  ### 1. Tabela `editais`
  - **organization_logo** (text) - URL do logo da organização promotora
  - **cover_image** (text) - URL da imagem de capa do edital
  - **gallery_images** (text[]) - Array de URLs para galeria de imagens
  - **organization_cnpj** (text) - CNPJ da organização
  - **organization_website** (text) - Site da organização

  ### 2. Constraint `editais_type_check`
  - Adiciona novos tipos: financiamento, parceria, selecao

  ## Notas
  - Campos de imagem são opcionais (nullable)
  - Tipos expandidos: licitacao, pregao, concurso, chamamento, credenciamento, financiamento, parceria, selecao, outro
  - Status válidos: draft, published, closed, cancelled, archived
*/

-- Adicionar campos de imagem e organização aos editais
DO $$
BEGIN
  -- Adicionar logo da organização
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'editais' AND column_name = 'organization_logo'
  ) THEN
    ALTER TABLE editais ADD COLUMN organization_logo text;
  END IF;

  -- Adicionar imagem de capa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'editais' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE editais ADD COLUMN cover_image text;
  END IF;

  -- Adicionar galeria de imagens
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'editais' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE editais ADD COLUMN gallery_images text[];
  END IF;

  -- Adicionar CNPJ da organização
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'editais' AND column_name = 'organization_cnpj'
  ) THEN
    ALTER TABLE editais ADD COLUMN organization_cnpj text;
  END IF;

  -- Adicionar website da organização
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'editais' AND column_name = 'organization_website'
  ) THEN
    ALTER TABLE editais ADD COLUMN organization_website text;
  END IF;
END $$;

-- Atualizar constraint de tipos para incluir novos valores
ALTER TABLE editais DROP CONSTRAINT IF EXISTS editais_type_check;
ALTER TABLE editais ADD CONSTRAINT editais_type_check 
  CHECK (type = ANY (ARRAY[
    'licitacao'::text, 
    'pregao'::text, 
    'concurso'::text, 
    'chamamento'::text, 
    'credenciamento'::text,
    'financiamento'::text,
    'parceria'::text,
    'selecao'::text,
    'outro'::text
  ]));

-- Inserir alguns editais de exemplo com imagens
INSERT INTO editais (
  slug,
  title,
  subtitle,
  description,
  type,
  status,
  organization_name,
  organization_logo,
  cover_image,
  contact_email,
  opening_date,
  closing_date,
  featured,
  created_at
) VALUES
(
  'edital-autonomia-feminina-2025',
  'Edital 003/2025: Autonomia Feminina',
  'CAIXA ECONÔMICA FEDERAL',
  'Apoio a projetos que promovam autonomia econômica e empoderamento feminino',
  'financiamento',
  'published',
  'Caixa Econômica Federal',
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3184393/pexels-photo-3184393.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'editais@caixa.gov.br',
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  NOW()
),
(
  'edital-economia-circular-2025',
  'Edital 002/2025: Economia Circular',
  'CAIXA ECONÔMICA FEDERAL',
  'Financiamento de iniciativas de economia circular e sustentabilidade',
  'financiamento',
  'published',
  'Caixa Econômica Federal',
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'editais@caixa.gov.br',
  NOW(),
  NOW() + INTERVAL '45 days',
  true,
  NOW()
),
(
  'parcerias-pela-natureza',
  'Parcerias pela Natureza',
  'Casa dos Ventos',
  'Apoio a projetos de conservação ambiental e desenvolvimento sustentável',
  'parceria',
  'published',
  'Casa dos Ventos',
  'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'parcerias@casadosventos.com.br',
  NOW(),
  NOW() + INTERVAL '60 days',
  true,
  NOW()
),
(
  'selecao-publica-regional-2025',
  'Seleção Pública Regional 2025: Soluções Baseadas na Natureza',
  'PETROBRAS',
  'Adaptação e Resiliência Climática através de soluções baseadas na natureza',
  'selecao',
  'published',
  'Petrobras',
  'https://images.pexels.com/photos/128299/pexels-photo-128299.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1268445/pexels-photo-1268445.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'selecao@petrobras.com.br',
  NOW(),
  NOW() + INTERVAL '90 days',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  organization_logo = EXCLUDED.organization_logo,
  cover_image = EXCLUDED.cover_image,
  updated_at = NOW();
