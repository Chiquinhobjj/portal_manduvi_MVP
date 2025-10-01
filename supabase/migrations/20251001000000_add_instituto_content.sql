/*
  # Add Instituto Manduvi Content

  1. New Tables
    - `instituto_sections` - Stores different sections of the Instituto page
      - `id` (uuid, primary key)
      - `section_key` (text, unique) - Identifier for the section
      - `title` (text) - Section title
      - `content` (text) - Section content
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `instituto_founders` - Stores information about the founders
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `description` (text)
      - `image_url` (text, nullable)
      - `order_index` (integer)
      - `created_at` (timestamptz)

    - `instituto_values` - Stores the institute's values
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `icon_name` (text, nullable)
      - `order_index` (integer)
      - `created_at` (timestamptz)

    - `instituto_projects` - Stores information about projects
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `beneficiaries` (integer, nullable)
      - `start_year` (integer, nullable)
      - `end_year` (integer, nullable)
      - `status` (text) - active, completed, etc.
      - `image_url` (text, nullable)
      - `order_index` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated admin write access
*/

-- Create instituto_sections table
CREATE TABLE IF NOT EXISTS instituto_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instituto_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instituto sections"
  ON instituto_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert instituto sections"
  ON instituto_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instituto sections"
  ON instituto_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create instituto_founders table
CREATE TABLE IF NOT EXISTS instituto_founders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  description text,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instituto_founders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instituto founders"
  ON instituto_founders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert instituto founders"
  ON instituto_founders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instituto founders"
  ON instituto_founders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create instituto_values table
CREATE TABLE IF NOT EXISTS instituto_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instituto_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instituto values"
  ON instituto_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert instituto values"
  ON instituto_values FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instituto values"
  ON instituto_values FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create instituto_projects table
CREATE TABLE IF NOT EXISTS instituto_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  beneficiaries integer,
  start_year integer,
  end_year integer,
  status text NOT NULL DEFAULT 'active',
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instituto_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instituto projects"
  ON instituto_projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert instituto projects"
  ON instituto_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instituto projects"
  ON instituto_projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial data for instituto sections
INSERT INTO instituto_sections (section_key, title, content, order_index) VALUES
('history', 'Nosso Histórico', 'O Instituto Manduvi, fundado em 2004 em Cuiabá, promove assistência social, educação, cultura, esporte, e geração de renda, com foco em crianças e adolescentes em vulnerabilidade social. Durante a pandemia, destacou-se com doações essenciais e parcerias, como a realizada com a APAE através do Jiu-Jitsu, promovendo inclusão e superação.', 1),
('about', 'Sobre', 'O Instituto Manduvi nasce inspirado na força da árvore Manduvi, símbolo de força e resiliência e nativa do Pantanal, promovendo ideias sustentáveis e transformadoras. Aqui, a inovação é essencial, acolhendo a diversidade e despertando o potencial de cada pessoa. Somos uma entidade sem fins lucrativos, mantida por doações, parcerias e voluntariado. Somos uma SocialTech que desenvolve soluções sustentáveis com impacto imediato e duradouro, marcando nossa história com parcerias de sucesso e programas inovadores que transformam realidades sociais.', 2),
('vision', 'Visão', 'Tornar-se referência em desenvolvimento sustentável e impacto social positivo, transformando vidas e comunidades através de iniciativas inovadoras e colaborativas, garantindo um futuro mais justo, inclusivo e sustentável para as gerações presentes e futuras.', 3),
('mission', 'Missão', 'Promover o desenvolvimento sustentável e gerar impacto social positivo, atuando em parceria com diferentes setores da sociedade. O Instituto Manduvi implementa projetos e ações em áreas como esporte, lazer, cultura, educação, saúde, ciência, tecnologia, inovação, meio ambiente, agricultura familiar e geração de renda, visando a transformação de vidas e comunidades para a construção de um mundo melhor.', 4);

-- Insert founders data
INSERT INTO instituto_founders (name, role, description, order_index) VALUES
('Chiquinho Fernandes', 'Fundador e Presidente', 'Fundador e Presidente do Instituto Manduvi', 1),
('Mestre Chicão', 'Fundador', 'Fundador e Mestre de Jiu-Jitsu', 2),
('Luzia Pessôa Fernandes', 'Fundadora', 'Fundadora do Instituto Manduvi', 3);

-- Insert values data
INSERT INTO instituto_values (title, description, icon_name, order_index) VALUES
('Acolher', 'Focado na diversidade, cria um ambiente inclusivo, oferecendo oportunidades de crescimento e empoderamento para todos.', 'heart', 1),
('Inovar', 'O instituto incentiva a inovação, buscando soluções que façam a diferença na vida das pessoas e promovam um futuro melhor.', 'lightbulb', 2),
('Impactar', 'O instituto trabalha para gerar impacto social positivo, transformando sonhos em realidade com resultados duradouros e sustentáveis.', 'target', 3),
('Inovação e Transformação', 'Comprometimento com soluções criativas e transformadoras', 'sparkles', 4),
('Inclusão e Diversidade', 'Valorização e respeito à diversidade em todas as suas formas', 'users', 5),
('Colaboração e Parceria', 'Trabalho conjunto com diferentes setores da sociedade', 'handshake', 6);

-- Insert some key projects
INSERT INTO instituto_projects (name, description, category, beneficiaries, start_year, end_year, status, order_index) VALUES
('Lutar Contra a Fome', 'Projeto alinhado ao ODS-2 da ONU, visando erradicar a fome e promover segurança alimentar e nutrição sustentável.', 'Assistência Social', 5000, 2020, NULL, 'active', 1),
('Esporte que Acolhe', 'Promove inclusão social e desenvolvimento humano através das artes marciais, expandindo seu alcance para todas as idades.', 'Esporte', 20000, 2021, NULL, 'active', 2),
('Jiu-Jitsu Para Todos - APAE', 'Iniciativa inovadora que integrou o jiu-jitsu nas atividades esportivas anuais para pessoas com deficiência.', 'Inclusão', 150000, 2006, 2016, 'completed', 3),
('Lutar pela Educação', 'Garantiu bolsas de estudo para mais de 100 crianças e jovens em instituições de ensino.', 'Educação', 100, 2006, 2020, 'completed', 4),
('Ser + Saudável', 'Promove saúde física e mental em comunidades carentes através de atividades físicas diversificadas e gratuitas.', 'Saúde', 15000, 2022, NULL, 'active', 5),
('Manduvi Araras Team', 'Formação de atletas de alto rendimento em esportes olímpicos, especialmente wrestling.', 'Esporte', 60, 2014, 2023, 'completed', 6),
('Programa Meu Futuro', 'Capacitação e qualificação profissional utilizando microlearning e inteligência artificial.', 'Educação', 3000, 2023, NULL, 'active', 7),
('Coloiado Saúde, Esporte e Lazer', 'Iniciativa pioneira que entrelaça tecnologia e ciência para estimular conexões estratégicas.', 'Tecnologia', 10000, 2023, NULL, 'active', 8)
ON CONFLICT DO NOTHING;
