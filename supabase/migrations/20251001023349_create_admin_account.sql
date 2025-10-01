/*
  # Criar Conta de Administrador

  ## Descrição
  Esta migração cria uma conta de administrador principal no sistema Manduvi.

  ## Detalhes da Conta
  - **Nome:** Francisco Jose Pessoa Fernandes Junior
  - **Email:** chiquinhopfernandes@gmail.com
  - **Senha:** Joao200800 (será configurada através do Supabase Auth)
  - **Perfil:** Administrador (super)
  - **Status:** Ativo

  ## Tabelas Afetadas
  1. `auth.users` - Usuário de autenticação do Supabase (criado manualmente via Auth)
  2. `users` - Registro principal do usuário
  3. `admin_profiles` - Perfil de administrador
  4. `notification_preferences` - Preferências de notificação

  ## Importante
  Esta migração pressupõe que o usuário já foi criado no Supabase Auth.
  Se ainda não foi criado, use o Supabase Dashboard ou Auth API para criar o usuário primeiro.

  ## Notas
  - A conta tem acesso_level 'super' para permissões completas
  - O status é definido como 'active' para acesso imediato
  - Email e perfil são marcados como verificados/completos
*/

-- ============================================================================
-- INSTRUÇÕES PARA CRIAÇÃO MANUAL DA CONTA
-- ============================================================================

/*
PASSO 1: Criar o usuário no Supabase Auth
-----------------------------------------
Você precisa criar o usuário primeiro usando uma das opções abaixo:

OPÇÃO A - Via Supabase Dashboard:
1. Acesse: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Vá em Authentication > Users
3. Clique em "Add user" ou "Invite user"
4. Preencha:
   - Email: chiquinhopfernandes@gmail.com
   - Password: Joao200800
   - Auto-confirm user: SIM (marque esta opção)
5. Copie o UUID gerado

OPÇÃO B - Via SQL (executar no SQL Editor do Supabase):
*/

-- Criar usuário na tabela auth.users
-- IMPORTANTE: Execute este comando no SQL Editor do Supabase Dashboard
-- E depois COPIE o UUID gerado para usar nos próximos comandos

-- Primeiro, você precisa criar o usuário via Auth API ou Dashboard
-- Após criar, pegue o UUID e substitua 'USER_ID_AQUI' nos comandos abaixo

/*
PASSO 2: Após criar o usuário e obter o UUID, execute os comandos abaixo
------------------------------------------------------------------------
Substitua 'USER_ID_AQUI' pelo UUID real do usuário criado
*/

-- Exemplo de como os comandos devem ser executados (substitua o UUID):
-- 
-- INSERT INTO users (id, email, role, status, email_verified, profile_completed, metadata)
-- VALUES (
--   'UUID_DO_USUARIO',  -- Substitua pelo UUID real
--   'chiquinhopfernandes@gmail.com',
--   'admin',
--   'active',
--   true,
--   true,
--   '{}'::jsonb
-- );
-- 
-- INSERT INTO admin_profiles (user_id, full_name, access_level, department, permissions_override, notes)
-- VALUES (
--   'UUID_DO_USUARIO',  -- Substitua pelo UUID real
--   'Francisco Jose Pessoa Fernandes Junior',
--   'super',
--   'Administração',
--   '{}'::jsonb,
--   'Conta de administrador principal'
-- );
-- 
-- INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, sms_enabled, frequency)
-- VALUES (
--   'UUID_DO_USUARIO',  -- Substitua pelo UUID real
--   true,
--   true,
--   false,
--   'immediate'
-- );

/*
RESUMO DAS CREDENCIAIS DE ACESSO
=================================
Email: chiquinhopfernandes@gmail.com
Senha: Joao200800
Perfil: Administrador (super)
*/
