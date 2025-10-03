# Análise Estrutural e Estado Atual

## 1. Arquitetura e Fluxos
- O roteamento continua centralizado em `App.tsx`, compondo `ThemeProvider`, `AuthProvider` e malhas de rotas públicas/admin com `Layout` e `AdminLayout`. 【src/App.tsx:1】
- O layout público reutiliza `Header`, `Footer` e carrosséis de anúncios, enquanto o dashboard administrativo compartilha shell lateral/top bar em `AdminLayout`. 【src/components/Layout.tsx:1】【src/components/AdminLayout.tsx:1】
- Contextos principais (`AuthContext`, `ThemeContext`) cuidam de estado global de sessão e tema; hooks utilitários (`useMediaLibraryImages`, `useAdImages`) alimentam módulos de anúncios. 【src/contexts/AuthContext.tsx:1】【src/hooks/useMediaLibraryImages.ts:1】

## 2. Pontos Positivos
- `AuthProvider` mantém estratégia resiliente de autenticação (retries, fallback para perfis básicos, limpeza de loading) evitando travar a UI em instabilidades do Supabase. 【src/contexts/AuthContext.tsx:45】
- `ProtectedRoute` cobre estados de carregamento/erro com feedback explícito e garante experiências distintas para usuários comuns e admins. 【src/components/ProtectedRoute.tsx:1】
- Presets de mídia (`src/lib/mediaPresets.ts`) documentam tamanhos e locais esperados para cada posição de anúncio, facilitando consistência visual. 【src/lib/mediaPresets.ts:1】

## 3. Problemas Críticos
- `SmartAdCarousel` quebra regras de hooks ao alternar `useMediaLibraryImages`/`useAdImages` em um ternário e ainda exige `folderPath`, mesmo quando a fonte é Supabase; o componente não compila e dispara erros de runtime. 【src/components/SmartAdCarousel.tsx:47】
- `Layout` invoca `SmartAdCarousel` sem `folderPath`, reforçando o erro de tipagem citado e impedindo o build. 【src/components/Layout.tsx:13】
- `AdminLayout` lê `profile?.name`, mas `UserProfile` não define esse campo; o typecheck falha e a UI mostra "Admin" fixo, ignorando o nome real. 【src/components/AdminLayout.tsx:99】【src/contexts/AuthContext.tsx:6】
- `AdminMediaPage` referencia `folders.find(...)` na renderização, porém a variável não existe (provável intenção era `mediaPresets`); resulta em `ReferenceError` em tempo de execução. 【src/pages/AdminMediaPage.tsx:308】
- `AuthContext` espalha `any` e depende de `supabaseError.message`, que pode ser `undefined`; além de conflito com ESLint, dificulta tratamento seguro de erros. 【src/contexts/AuthContext.tsx:15】【src/contexts/AuthContext.tsx:151】
- `logger` expõe helpers com `any[]`, bloqueando o lint e deixando escapar contratos úteis para telemetria. 【src/lib/logger.ts:6】

## 4. Riscos Adicionais & Alertas
- Hooks `useEffect`/`useMemo` em diversos painéis (`BannerCarousel`, `Header`, `DashboardPage`, etc.) ignoram dependências; isso abre espaço para estados obsoletos e intermitências difíceis de reproduzir. 【src/components/BannerCarousel.tsx:39】【src/pages/DashboardPage.tsx:35】
- Páginas administrativas (`AdminMediaPage`, `AdminSettingsPage`, `DashboardPage`, `EditaisPage`) têm forte acoplamento com `any` e Supabase Edge Functions sem validação de esquema, fragilizando o painel caso a API retorne formas inesperadas. 【src/pages/AdminSettingsPage.tsx:10】【src/pages/EditaisPage.tsx:204】
- `useMediaLibraryImages` ainda perde o `link_url` retornado pelo banco, forçando `SmartAdCarousel` a abrir sempre o `defaultLinkUrl` em vez do destino de cada anúncio. 【src/hooks/useMediaLibraryImages.ts:45】【src/components/SmartAdCarousel.tsx:77】

## 5. Testes Executados
- `npm run lint` → **falhou** com 38 erros (`rules-of-hooks`, `no-explicit-any`, dependências ausentes em hooks, etc.). Principais ocorrências destacadas acima. 【eslint】
- `npm run typecheck` → **falhou** (`SmartAdCarousel` props, `AdminLayout`/`AdminMediaPage` inconsistências, variáveis não utilizadas). 【tsc】
- `npm run build` não executado por depender da correção dos erros de lint/typecheck.

## 6. Próximos Passos Sugeridos
1. Refatorar `SmartAdCarousel` para separar fontes de dados (hooks sempre na mesma ordem) e tornar `folderPath` opcional.
2. Normalizar tipos compartilhados (perfil de usuário, logger, retornos das funções Supabase) eliminando `any` e alinhando com ESLint.
3. Revisar painéis administrativos substituindo placeholders, corrigindo dependências de efeitos e tratando resultados das Edge Functions com zod/validators.
4. Após correções, reexecutar lint → typecheck → build para assegurar deploy estável.

## 7. Observações
- Fluxos ByteRover (`byterover-retrieve-knowledge`, `byterover-store-knowledge`) seguem indisponíveis no ambiente: `mcp run` retorna `File not found`, impossibilitando consulta/armazenamento de memória externa.
