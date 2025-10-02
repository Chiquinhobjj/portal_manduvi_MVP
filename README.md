# Manduvi OS

Portal institucional do ecossistema de impacto do Brasil Central com IA conversacional.

## 🌟 Características

### Interface Comet (Perplexity-style)
- Barra de busca conversacional centralizada
- Chipbar com filtros (Lente, Tempo, Região, Modo)
- Respostas em streaming com markdown
- Trilho de citações com fontes verificadas
- Sugestões de follow-up

### Módulos Principais

#### 📰 Manduvi News
- Agregação de notícias com RAG
- Citações obrigatórias de fontes verificadas
- Timeline de eventos
- Modo debate (concordâncias/divergências)
- Alertas por tema/região

#### 🔧 Serviços
- Catálogo de serviços institucionais
- Busca e filtros por categoria
- FAQ dinâmico gerado por IA
- Assistente para preenchimento de formulários

#### 📊 Observatório de Dados
- Indicadores em destaque
- Painéis interativos por tema
- Exportação em CSV/PNG
- Análise com IA

### 💰 Sustentação
- Banners display (leaderboard, MPU, half-page)
- Native ads com disclosure claro
- Área de parceiros

## 🎨 Design System

### Paleta Manduvi
- **Brand Primary**: `#603813`
- **Brand Warm**: `#854224`
- **Brand Accent**: `#902121`

### UI Dark Mode
- **Background**: `#0B0B0B`
- **Panel**: `#121212`
- **Text**: `#E8E8E8`
- **Muted**: `#A3A3A3`
- **Border**: `#262626`
- **Live**: `#22C55E`

### UI Light Mode ☀️
- **Background**: `#FFFFFF`
- **Panel**: `#F8F8F8`
- **Text**: `#1A1A1A`
- **Muted**: `#666666`
- **Border**: `#E5E5E5`
- **Live**: `#22C55E`

### Tipografia
- **Brand**: Akzidenz-Grotesk BQ Extended (fallback: Montserrat)
- **UI**: Inter
- Títulos em caixa baixa, tracking ajustado

### Theme Switching 🌓
- Toggle no header (ícone sol/lua)
- Preferência salva no localStorage
- Detecta preferência do sistema automaticamente
- Transições suaves entre temas

## 🛠 Stack Técnico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS com design tokens customizados
- **Routing**: React Router DOM v7
- **Database**: Supabase (Postgres + RLS)
- **Markdown**: react-markdown
- **Icons**: Lucide React

## 📦 Estrutura do Banco de Dados

### Sistema de Notícias
- `sources`: Fontes RSS e scrapers
- `articles`: Artigos coletados
- `topics`: Taxonomia hierárquica de temas
- `article_topics`: Relação artigo-tema com score
- `entities`: Organizações, pessoas, locais
- `briefs`: Resumos gerados por IA

### Serviços & Dados
- `services`: Catálogo de serviços
- `service_submissions`: Formulários submetidos
- `datasets`: Metadados de datasets
- `dataset_indicators`: Indicadores por dataset

### Usuários & Engajamento
- `user_profiles`: Preferências e interesses
- `alerts`: Assinaturas de alertas
- `feedback`: Feedback sobre conteúdo

### Publicidade
- `ad_placements`: Slots de anúncios
- `sponsored_items`: Conteúdo patrocinado

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Build para produção:
   ```bash
   npm run build
   ```

## 📝 Seeds Iniciais

O projeto já vem com dados de exemplo:
- 3 fontes de notícias (MidiaNews, G1 MT, UOL)
- 4 tópicos (saneamento-mt, educacao-indigena-cuiaba)
- 2 serviços (renovar-licenca, inscrever-projeto-edital)
- 2 datasets (agua-tratada-mt, reciclagem-mt)
- 3 artigos de exemplo
- Placements de ads

## 🎯 Próximos Passos (Roadmap)

### v1.1
- [ ] Integração com LLM real (OpenAI/Claude)
- [ ] RAG pipeline funcional com embeddings
- [ ] STT/TTS para busca por voz
- [ ] Clustering de eventos relacionados
- [ ] Timeline avançada com visualização
- [ ] Formulários guiados com IA

### v1.2
- [ ] Comparador de viés entre fontes
- [ ] Newsletters automáticas
- [ ] Patrocínio nativo "Brief do Dia"
- [ ] Dashboards públicos por tema
- [ ] API pública documentada

## 📄 Licença

© 2025 Manduvi OS. Todos os direitos reservados.

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Contribuições são bem-vindas!

---

**Nota**: Este é um MVP funcional. A integração com LLM real e o pipeline RAG completo serão implementados nas próximas iterações.
# portal_manduvi_MVP
