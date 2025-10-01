/*
  # Corrigir Recursão Infinita nas Políticas RLS

  ## Problema
  - A política "First admin can be created" causa recursão infinita
  - Ao verificar EXISTS na própria tabela users durante INSERT, cria um loop

  ## Solução
  - Remover a verificação de EXISTS durante INSERT
  - Permitir INSERT de admin de forma controlada pelo backend
  - Manter segurança através da aplicação

  ## Mudanças
  1. Remover políticas antigas que causam recursão
  2. Criar política simples para INSERT que não consulta a própria tabela
  3. Segurança: usuário só pode inserir seu próprio ID
*/

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "First admin can be created" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- 2. Criar política simples de INSERT sem recursão
-- Permite que usuários autenticados insiram apenas seus próprios registros
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Observação: A validação de role='admin' apenas quando não há admins
-- será feita na aplicação, não no banco de dados, para evitar recursão
