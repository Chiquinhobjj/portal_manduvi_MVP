# Sistema de Autenticação e Gestão Multi-Perfil

Este documento descreve o sistema de autenticação completo implementado no Manduvi OS com suporte a múltiplos perfis de usuário, gestão de editais, e dashboard administrativo com BI.

## Perfis de Usuário

O sistema suporta 6 tipos distintos de perfis:

### 1. Admin
- **Acesso completo** ao sistema
- Gerenciamento de usuários e permissões
- Acesso ao dashboard de BI
- Criação de campos personalizados
- Revisão e aprovação de contas
- Gerenciamento de editais e candidaturas

### 2. Empresa
- Perfil para empresas privadas
- Campos: CNPJ, razão social, contato, endereço, setor, website, redes sociais
- Pode participar de editais e parcerias
- Sistema de verificação de documentos
- Níveis de patrocínio (bronze, prata, ouro, platina)

### 3. Terceiro Setor
- ONGs, OSCIPs, associações, fundações
- Campos: CNPJ, tipo de organização, áreas de atuação, público-alvo, missão
- Certificações e parcerias
- Orçamento anual e equipe
- Pode criar e participar de editais

### 4. Órgão Público
- Instituições governamentais
- Campos: CNPJ, tipo (federal, estadual, municipal), esfera, área de atuação
- Documento de autorização
- Pode criar e gerenciar editais públicos

### 5. Colaborador
- Profissionais e consultores independentes
- Campos: CPF, profissão, expertise, bio, CV
- Disponibilidade e taxa horária
- Habilidades e certificações
- Pode participar de editais

### 6. Usuário
- Perfil padrão para pessoas físicas
- Campos: CPF, ocupação, interesses
- Pode acompanhar editais e iniciativas
- Sistema de favoritos e alertas

## Funcionalidades Principais

### Autenticação
- **Login/Registro** com email e senha (Supabase Auth)
- Verificação de email
- Recuperação de senha
- Controle de sessão
- Rastreamento de login (IP, user agent)

### Perfis Dinâmicos
- Cada tipo de perfil tem sua própria tabela com campos específicos
- Sistema de **campos personalizados** permite admins adicionar novos campos sem migração
- Todos os perfis têm campos de metadata extensível (JSONB)

### Editais
- Sistema completo de gestão de editais/licitações
- **8 categorias padrão**: Licitações, Pregões, Concursos, Chamamentos, Credenciamento, Consultas, Subvenções, Outros
- Workflow de status: draft → published → closed → archived
- Sistema de candidaturas com documentos
- Comentários e perguntas
- Favoritos e alertas personalizados
- Rastreamento de visualizações para analytics

### Dashboard e BI
- **Dashboard Administrativo**:
  - Estatísticas em tempo real (usuários, editais, candidaturas)
  - Gráficos e métricas
  - Atividade recente
  - Acesso rápido a funções administrativas

- **Dashboard do Usuário**:
  - Minhas candidaturas
  - Status de candidaturas
  - Ações rápidas

### Permissões
- Sistema granular de permissões por recurso e ação
- Mapeamento de permissões por role
- Verificação de permissões em tempo real
- RLS (Row Level Security) em todas as tabelas

### Notificações
- Sistema completo de notificações
- Tipos: info, success, warning, error, announcement
- Preferências de canal (email, push, SMS)
- Frequência configurável
- Histórico completo

### Auditoria
- Log completo de todas as ações
- Rastreamento de mudanças (JSONB)
- IP e user agent
- Pesquisável por usuário, recurso e data

## Estrutura do Banco de Dados

### Tabelas de Autenticação
- `users` - Informações base do usuário
- `user_sessions` - Histórico de sessões
- `admin_profiles`, `empresa_profiles`, `terceiro_setor_profiles`, `orgao_publico_profiles`, `colaborador_profiles`, `usuario_profiles`

### Tabelas de Editais
- `editais_categories` - Categorias hierárquicas
- `editais` - Editais principais
- `editais_documents` - Documentos anexos
- `editais_applications` - Candidaturas
- `application_documents` - Documentos da candidatura
- `application_history` - Histórico de mudanças
- `editais_comments` - Perguntas e respostas
- `editais_favorites` - Favoritos dos usuários
- `editais_alerts` - Alertas personalizados
- `editais_views` - Analytics de visualizações

### Tabelas de Sistema
- `permissions` - Definições de permissões
- `role_permissions` - Mapeamento role-permissão
- `custom_fields` - Campos personalizados dinâmicos
- `custom_field_values` - Valores dos campos personalizados
- `audit_logs` - Logs de auditoria
- `notifications` - Notificações do sistema
- `notification_preferences` - Preferências de notificação

## Segurança

### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado com políticas específicas:

- **Leitura pública**: Editais publicados, categorias ativas
- **Leitura autenticada**: Próprios dados, dados relacionados
- **Escrita restrita**: Apenas owner ou admin
- **Admin override**: Admins podem ler/escrever tudo

### Validações
- Checks de tipo em campos (enums)
- Validação de CNPJ/CPF único
- Datas de fechamento obrigatórias
- Status válidos por workflow

### Auditoria
- Todas as ações importantes são logadas
- Mudanças rastreadas em JSONB
- IP e user agent registrados

## Rotas Disponíveis

### Públicas
- `/` - Home
- `/noticias` - Notícias
- `/servicos` - Serviços
- `/dados` - Dados
- `/temas` - Temas
- `/editais` - Lista de editais
- `/iniciativas` - Iniciativas
- `/login` - Login
- `/register` - Registro

### Protegidas (Requerem Autenticação)
- `/dashboard` - Dashboard personalizado por perfil
- `/profile` - Gerenciamento do perfil
- `/my-applications` - Minhas candidaturas
- `/favorites` - Editais favoritos

### Admin (Apenas Administradores)
- `/admin/users` - Gestão de usuários
- `/admin/editais` - Gestão de editais
- `/admin/applications` - Revisão de candidaturas
- `/admin/custom-fields` - Gerenciamento de campos
- `/admin/analytics` - Analytics avançados
- `/admin/settings` - Configurações do sistema

## Contextos React

### AuthContext
Gerencia autenticação e estado do usuário:
```typescript
const {
  user,           // Usuário do Supabase
  session,        // Sessão ativa
  profile,        // Perfil completo
  loading,        // Estado de carregamento
  signIn,         // Login
  signUp,         // Registro
  signOut,        // Logout
  refreshProfile, // Atualizar perfil
  hasPermission,  // Verificar permissão
  isAdmin         // Check se é admin
} = useAuth();
```

### ThemeContext
Gerencia tema claro/escuro (já existente)

## Componentes

### ProtectedRoute
Wrapper para rotas protegidas com verificação de autenticação e roles:
```tsx
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPage />
</ProtectedRoute>
```

### Header
Atualizado com:
- Link para Editais no menu
- Botão de Login (quando deslogado)
- Menu do usuário (quando logado) com avatar, nome, role e ações
- Suporte mobile completo

## Próximos Passos Sugeridos

1. **Páginas de Perfil**: Criar páginas de visualização e edição para cada tipo de perfil
2. **Edital Detail**: Página de detalhe de edital com candidatura
3. **Admin Pages**: Criar páginas administrativas completas
4. **Custom Fields UI**: Interface para criar e gerenciar campos personalizados
5. **Analytics Avançados**: Dashboards com gráficos e relatórios exportáveis
6. **Sistema de Notificações**: Interface de notificações no header
7. **Upload de Arquivos**: Integrar Supabase Storage para uploads
8. **Email Templates**: Templates de email para notificações
9. **Busca Avançada**: Sistema de busca full-text em editais
10. **Exportação de Dados**: Gerar relatórios em PDF/Excel

## Variáveis de Ambiente

O sistema usa as variáveis já configuradas:
```
VITE_SUPABASE_URL=<sua-url>
VITE_SUPABASE_ANON_KEY=<sua-key>
```

## Como Usar

### Criar Usuário Admin
```sql
-- Primeiro, registre via interface /register
-- Depois, atualize o role para admin:
UPDATE users SET role = 'admin', status = 'active' WHERE email = 'seu@email.com';

-- Crie o perfil admin:
INSERT INTO admin_profiles (user_id, full_name, access_level)
VALUES ('<user-id>', 'Nome do Admin', 'super');
```

### Criar Edital
```sql
INSERT INTO editais (
  slug, title, description, type, category_slug,
  organization_name, closing_date, status, created_by
) VALUES (
  'edital-teste', 'Edital de Teste', 'Descrição do edital',
  'licitacao', 'licitacoes', 'Órgão Exemplo',
  '2025-12-31', 'published', '<admin-user-id>'
);
```

## Migrações Aplicadas

1. `create_authentication_system` - Sistema completo de auth e perfis
2. `create_editais_system` - Sistema de editais e candidaturas

## Tecnologias Utilizadas

- **Supabase Auth** - Autenticação
- **Supabase Database** - PostgreSQL com RLS
- **React Context** - Gerenciamento de estado
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Lucide Icons** - Ícones
- **TypeScript** - Type safety

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Confira as policies de RLS no painel do Supabase
3. Revise a documentação das migrações
4. Consulte o código dos componentes de exemplo
