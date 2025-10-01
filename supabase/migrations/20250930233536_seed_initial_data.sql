/*
  # Seed Data Inicial - Manduvi OS MVP

  ## Dados Iniciais
  
  ### 1. Fontes de Notícias
  - MidiaNews (RSS)
  - G1 MT (RSS)
  - UOL (RSS)
  
  ### 2. Tópicos
  - saneamento-mt
  - educacao-indigena-cuiaba
  
  ### 3. Serviços
  - renovar-licenca
  - inscrever-projeto-edital
  
  ### 4. Datasets
  - agua-tratada-mt
  - reciclagem-mt
  
  ### 5. Ad Placement Exemplo
  - Leaderboard na home
*/

-- Fontes de notícias
INSERT INTO sources (id, name, type, region, reliability_score, rss_url, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'MidiaNews', 'rss', 'MT', 85, 'https://www.midianews.com.br/feed', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'G1 Mato Grosso', 'rss', 'MT', 90, 'https://g1.globo.com/mt/mato-grosso/rss.xml', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'UOL', 'rss', 'Brasil', 88, 'https://rss.uol.com.br/feed/noticias.xml', 'active')
ON CONFLICT (id) DO NOTHING;

-- Tópicos
INSERT INTO topics (slug, label, taxonomy_path, parent_slug, description) VALUES
  ('saneamento', 'Saneamento', 'saneamento', NULL, 'Água, esgoto e resíduos sólidos'),
  ('saneamento-mt', 'Saneamento em MT', 'saneamento/saneamento-mt', 'saneamento', 'Saneamento básico em Mato Grosso'),
  ('educacao', 'Educação', 'educacao', NULL, 'Educação e ensino'),
  ('educacao-indigena-cuiaba', 'Educação Indígena Cuiabá', 'educacao/educacao-indigena-cuiaba', 'educacao', 'Educação indígena na região de Cuiabá')
ON CONFLICT (slug) DO NOTHING;

-- Serviços
INSERT INTO services (slug, title, summary, description, steps, faq, owner_org, category, tags, is_active) VALUES
  (
    'renovar-licenca',
    'Renovar Licença Ambiental',
    'Renovação de licenças ambientais para atividades produtivas',
    'Serviço para renovação de licenças ambientais de operação, instalação e localização no estado de Mato Grosso.',
    '[
      {"step": 1, "title": "Documentação", "description": "Reúna toda documentação necessária"},
      {"step": 2, "title": "Protocolo", "description": "Protocole o pedido no sistema SIMLAM"},
      {"step": 3, "title": "Análise", "description": "Aguarde análise técnica (até 60 dias)"},
      {"step": 4, "title": "Vistoria", "description": "Receba vistoria se necessário"},
      {"step": 5, "title": "Emissão", "description": "Receba a licença renovada"}
    ]'::jsonb,
    '[
      {"question": "Quanto tempo demora?", "answer": "Em média 60 dias úteis após protocolo"},
      {"question": "Qual o custo?", "answer": "Varia conforme porte e atividade, consulte tabela DAR"},
      {"question": "Posso renovar online?", "answer": "Sim, através do sistema SIMLAM"}
    ]'::jsonb,
    'SEMA-MT',
    'meio-ambiente',
    ARRAY['licenca', 'ambiental', 'renovacao'],
    true
  ),
  (
    'inscrever-projeto-edital',
    'Inscrever Projeto em Edital',
    'Submissão de projetos para editais de fomento',
    'Serviço para inscrição de projetos sociais, culturais e de inovação em editais públicos de fomento.',
    '[
      {"step": 1, "title": "Escolha o edital", "description": "Identifique o edital adequado ao seu projeto"},
      {"step": 2, "title": "Prepare documentação", "description": "Reúna projeto, orçamento, documentos pessoais/jurídicos"},
      {"step": 3, "title": "Cadastro", "description": "Cadastre-se na plataforma do edital"},
      {"step": 4, "title": "Submissão", "description": "Preencha formulário e anexe documentos"},
      {"step": 5, "title": "Acompanhamento", "description": "Acompanhe resultado pela plataforma"}
    ]'::jsonb,
    '[
      {"question": "Posso me inscrever em múltiplos editais?", "answer": "Sim, desde que seu projeto atenda aos requisitos de cada um"},
      {"question": "Preciso ter CNPJ?", "answer": "Depende do edital, alguns aceitam pessoa física"},
      {"question": "Como saber se fui aprovado?", "answer": "Os resultados são publicados na plataforma e no Diário Oficial"}
    ]'::jsonb,
    'SEC-MT',
    'cultura',
    ARRAY['edital', 'projeto', 'fomento', 'cultura'],
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Datasets
INSERT INTO datasets (slug, title, summary, description, category, region, frequency, last_updated) VALUES
  (
    'agua-tratada-mt',
    'Água Tratada em MT',
    'Indicadores de tratamento e distribuição de água potável',
    'Dados sobre cobertura de tratamento de água, qualidade da água distribuída e perdas na rede de distribuição nas cidades de Mato Grosso.',
    'saneamento',
    'MT',
    'mensal',
    now() - interval '15 days'
  ),
  (
    'reciclagem-mt',
    'Reciclagem em MT',
    'Coleta seletiva e reciclagem de resíduos sólidos',
    'Estatísticas sobre coleta seletiva, reciclagem de materiais e destinação de resíduos sólidos urbanos em Mato Grosso.',
    'meio-ambiente',
    'MT',
    'trimestral',
    now() - interval '30 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- Indicadores de exemplo
INSERT INTO dataset_indicators (dataset_slug, indicator_key, label, value, unit, reference_date) VALUES
  ('agua-tratada-mt', 'cobertura_tratamento', 'Cobertura de Tratamento', 87.5, '%', CURRENT_DATE - interval '15 days'),
  ('agua-tratada-mt', 'perdas_distribuicao', 'Perdas na Distribuição', 32.8, '%', CURRENT_DATE - interval '15 days'),
  ('agua-tratada-mt', 'populacao_atendida', 'População Atendida', 2840000, 'habitantes', CURRENT_DATE - interval '15 days'),
  ('reciclagem-mt', 'taxa_reciclagem', 'Taxa de Reciclagem', 14.2, '%', CURRENT_DATE - interval '30 days'),
  ('reciclagem-mt', 'coleta_seletiva_municipios', 'Municípios com Coleta Seletiva', 48, 'municípios', CURRENT_DATE - interval '30 days'),
  ('reciclagem-mt', 'toneladas_recicladas', 'Toneladas Recicladas (mês)', 8450, 'toneladas', CURRENT_DATE - interval '30 days')
ON CONFLICT (id) DO NOTHING;

-- Ad Placement de exemplo (leaderboard na home)
INSERT INTO ad_placements (page, position, format, partner, is_active) VALUES
  ('home', 'leaderboard', '970x90', 'Placeholder', true),
  ('noticias', 'mpu', '300x250', 'Placeholder', true)
ON CONFLICT (id) DO NOTHING;

-- Artigos de exemplo (simulando notícias)
INSERT INTO articles (id, url, title, lead, source_id, published_at, hash, is_opinion, lang) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'https://example.com/saneamento-mt-avanca',
    'Saneamento básico em MT avança 12% em 2025',
    'Novo estudo aponta crescimento na cobertura de tratamento de água e esgoto no estado, com investimentos de R$ 450 milhões.',
    '550e8400-e29b-41d4-a716-446655440001',
    now() - interval '2 hours',
    'hash001',
    false,
    'pt'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'https://example.com/educacao-indigena-cuiaba',
    'Cuiabá inaugura nova escola indígena com ensino bilíngue',
    'Instituição atenderá 280 alunos com foco em preservação cultural e língua materna Bororo.',
    '550e8400-e29b-41d4-a716-446655440002',
    now() - interval '5 hours',
    'hash002',
    false,
    'pt'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'https://example.com/agua-cuiaba-qualidade',
    'Qualidade da água em Cuiabá é aprovada em 98% das análises',
    'Relatório da Vigilância Sanitária indica conformidade com padrões do Ministério da Saúde em quase totalidade das amostras.',
    '550e8400-e29b-41d4-a716-446655440001',
    now() - interval '1 day',
    'hash003',
    false,
    'pt'
  )
ON CONFLICT (id) DO NOTHING;

-- Relações artigo-tópico
INSERT INTO article_topics (article_id, topic_slug, score) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'saneamento-mt', 0.95),
  ('650e8400-e29b-41d4-a716-446655440002', 'educacao-indigena-cuiaba', 0.98),
  ('650e8400-e29b-41d4-a716-446655440003', 'saneamento-mt', 0.88)
ON CONFLICT (article_id, topic_slug) DO NOTHING;
