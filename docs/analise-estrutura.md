# Análise Estrutural e Estado Atual

## 1. Arquitetura e Fluxos
- O roteamento continua centralizado em `App.tsx`, compondo `ThemeProvider`, `AuthProvider` e malhas de rotas públicas/admin com `Layout` e `AdminLayout`. 【src/App.tsx:1】
- O layout público reutiliza `Header`, `Footer` e carrosséis de anúncios, enquanto o dashboard administrativo compartilha shell lateral/top bar em `AdminLayout`. 【src/components/Layout.tsx:1】【src/components/AdminLayout.tsx:1】
- Contextos principais (`AuthContext`, `ThemeContext`) cuidam de estado global de sessão e tema; hooks utilitários (`useMediaLibraryImages`, `useAdImages`) alimentam módulos de anúncios. 【src/contexts/AuthContext.tsx:1】【src/hooks/useMediaLibraryImages.ts:1】

## 2. Pontos Positivos
- `AuthProvider` mantém estratégia resiliente de autenticação (retries, fallback para perfis básicos, limpeza de loading) evitando travar a UI em instabilidades do Supabase. 【src/contexts/AuthContext.tsx:45】
- `ProtectedRoute` cobre estados de carregamento/erro com feedback explícito e garante experiências distintas para usuários comuns e admins. 【src/components/ProtectedRoute.tsx:1】
- Presets de mídia (`src/lib/mediaPresets.ts`) documentam tamanhos e locais esperados para cada posição de anúncio, facilitando consistência visual. 【src/lib/mediaPresets.ts:1】
- Serviços tipados e centralizados em `src/admin/services/` (`users.ts`, `banners.ts`) reduzem repetição de chamadas Supabase e pavimentam a adoção futura de React Query.

## 3. Problemas Críticos
- Módulos administrativos não migrados (`AdminContentPage`, `AdminSettingsPage`, `DashboardPage`, painéis de editais/iniciativas) seguem usando `any` e efeitos sem dependências, mantendo o lint em falha e arriscando regressões. 【src/pages/AdminContentPage.tsx:12】【src/pages/DashboardPage.tsx:211】
- O componente `VantaBackground` preserva assinaturas `any` e precisa de tipagem segura para alinhar com o novo ecossistema estrito. 【src/components/VantaBackground.tsx:6】
- Diversos hooks (`BannerCarousel`, `Header`, `EditaisPage`, etc.) continuam sem dependências declaradas, podendo deixar estados desatualizados em runtime. 【src/components/BannerCarousel.tsx:39】【src/pages/EditaisPage.tsx:204】
- Edge Functions e inserções diretas ainda não possuem validação formal (Zod) e testes automatizados, o que compromete a robustez do painel diante de mudanças no Supabase.

## 4. Riscos Adicionais & Alertas
- Hooks `useEffect`/`useMemo` em diversos painéis (`BannerCarousel`, `Header`, `DashboardPage`, etc.) ignoram dependências; isso abre espaço para estados obsoletos e intermitências difíceis de reproduzir. 【src/components/BannerCarousel.tsx:39】【src/pages/DashboardPage.tsx:35】
- Páginas administrativas (`AdminMediaPage`, `AdminSettingsPage`, `DashboardPage`, `EditaisPage`) têm forte acoplamento com `any` e Supabase Edge Functions sem validação de esquema, fragilizando o painel caso a API retorne formas inesperadas. 【src/pages/AdminSettingsPage.tsx:10】【src/pages/EditaisPage.tsx:204】
- Falta monitoramento automático das ações administrativas (diff detalhado, métricas de uso), limitando a rastreabilidade em auditorias ou incidentes.

## 5. Testes Executados
- `npm run lint` → **falhou** com 19 erros/13 alertas (restos de `any` em módulos herdados, dependências ausentes e ajustes em `VantaBackground`). Principais ocorrências listadas nos itens críticos. 【eslint】
- `npm run typecheck` → **ok** após refatoração (`tsc --noEmit -p tsconfig.app.json`).
- `npm run build` ainda não executado; depende do lint estabilizado.

## 6. Próximos Passos Sugeridos
1. Consolidar testes (lint/typecheck/build) após estabilizar migração para hooks tipados e remover os usos remanescentes de `any` nas páginas administrativas.
2. Evoluir o data layer para React Query assim que o ambiente permitir instalar novas dependências (tentativas atuais de `npm install` esbarram em timeout de rede).
3. Completar refatoração dos módulos administrativos restantes (`AdminContentPage`, `AdminSettingsPage`, painéis de editais/dados) aplicando o mesmo padrão tipado.
4. Automatizar auditoria em `admin_activity_log` com diffs detalhados e dashboards no módulo de observabilidade.

## 7. Plano de Reconstrução do Painel Admin

### Objetivos
- Garantir compatibilidade completa com o backend Supabase (tabelas `banners`, `content_sections`, `site_settings`, `media_library`, `admin_activity_log`, `users`, `editais`, etc.).
- Priorizar workflows administrativos reais: gerenciamento de conteúdo, anúncios, usuários, configurações globais e monitoramento.
- Melhorar DX com tipos estritos, feedbacks claros e estado consistente.

### Estratégia em Três Camadas
1. **Data Layer tipada**
   - Centralizar chamadas Supabase/Edge Functions em `/src/services/admin/*` com Zod ou tipos compartilhados a partir do diretório `supabase/types` (gerados via `supabase gen types typescript`).
   - Implementar hooks via React Query (`@tanstack/react-query`) para cache, refetch e estados (`isLoading`, `isError`, `invalidateQueries`).
   - Mapear endpoints existentes:
     - Função Edge `admin-users` para moderação de contas.
     - Tabelas `banners`, `content_sections`, `site_settings`, `media_library`, `admin_activity_log`, `editais`, `initiatives`.
     - Views/queries auxiliares: `dashboard_stats` (ver migração `20241220000000_optimize_dashboard_stats.sql`).

2. **Camada de Domínio/Admin Modules**
   - Criar estrutura `src/admin/modules/<feature>` contendo:
     - `api.ts` (serviços/hook composables)
     - `components/` (UI específica reutilizável)
     - `pages/` (containers de rota)
     - `forms/` (react-hook-form + Zod)
   - Módulos iniciais:
     1. **Dashboard** – estatísticas rápidas (usuários, banners ativos, editais, uso de mídia) + timeline de `admin_activity_log`.
     2. **Conteúdo** – CRUD de `content_sections` por página/ordem; editor rich-text/JSON com pré-visualização.
     3. **Banners & Ads** – gestão total (upload via `media_library`, agendamento, analytics em tempo real usando `banner_analytics`).
     4. **Biblioteca de Mídia** – navegador com filtros/pastas (usando `mediaPresets`), upload simplificado e ligação com conteúdo/banners.
     5. **Editais & Iniciativas** – administração completa (status, datas, anexos) baseada nas migrações `create_editais_system`/`create_initiatives_system`.
     6. **Usuários & Perfis** – moderação, upgrade/downgrade de roles, resets, verificação de métricas.
     7. **Configurações Globais** – editor de `site_settings` com validação de tipo e preview.

3. **UX/UI & Shell Comum**
   - Manter `AdminLayout` como shell, mas extrair `navItems` para configuração dinâmica vinda de permissões.
   - Implementar breadcrumbs, busca global (Command Palette) e alertas persistentes.
   - Usar design system unificado (`Card`, `Table`, `EmptyState`, `FormField`, `ConfirmDialog`).
   - Implementar auditoria: toda ação chama `logAdminActivity` com diff automático das mudanças (comparar payloads antes/depois).

### Sequenciamento de Entregas
1. **Infra/Admin Core**: configurar React Query provider, tipos gerados do Supabase, wrappers para auth guard + handle errors globais.
2. **Usuários & Autenticação**: refatorar `AdminUsersPage` com hooks tipados + Edge Function, adicionar filtros salvos e ações em massa.
3. **Mídia & Banners**: corrigir `SmartAdCarousel` consumo, reconstruir bibliotecas e analytics.
4. **Conteúdo & Configurações**: CRUD de seções + site settings com versionamento.
5. **Editais/Iniciativas**: telas completas com states (draft/published), previews, integração com Supabase Storage.
6. **Observabilidade**: dashboards, logs em `admin_activity_log`, download CSV.
7. **QA**: suíte de testes (React Testing Library + MSW), lint/typecheck/build pipelines.

### Checklist Técnico
- [ ] Instalar `@tanstack/react-query`, `zod`, `react-hook-form`.
- [ ] Gerar tipos: `supabase gen types typescript --project-id <id> > src/lib/supabaseTypes.ts`.
- [ ] Criar `supabaseAdmin` client (service role) para edge contexts quando necessário.
- [ ] Refatorar `AuthContext` para expor `profile.displayName` e permissões.
- [ ] Substituir `any` por tipos fortes (logger, contextos, páginas) e ajustar ESLint para `@typescript-eslint/strict`.
- [ ] Adicionar testes de integração para principais fluxos (ex.: criar banner, aprovar usuário, publicar edital).

## 8. Observações
- Fluxos ByteRover (`byterover-retrieve-knowledge`, `byterover-store-knowledge`) seguem indisponíveis no ambiente: `mcp run` retorna `File not found`, impossibilitando consulta/armazenamento de memória externa.
- Tentativas de instalar `@tanstack/react-query`, `zod` e `react-hook-form` esbarraram em `npm install` com timeout de rede; quando o acesso for liberado, basta executar o comando pendente e conectar os serviços criados.
