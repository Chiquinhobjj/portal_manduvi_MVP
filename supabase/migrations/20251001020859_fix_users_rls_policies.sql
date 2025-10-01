/*
  # Corrigir Políticas RLS da Tabela Users

  ## Problema
  - Faltava política de INSERT para permitir criação de usuários
  - Usuários não conseguiam se registrar devido a violação de RLS

  ## Mudanças
  1. Remover políticas antigas de INSERT se existirem
  2. Adicionar política INSERT para permitir usuários criarem seus próprios registros
  3. Adicionar política INSERT especial para primeiro admin (quando não há admins)
  4. Limpar usuários órfãos do auth.users que não têm entrada na tabela users
  
  ## Segurança
  - Usuários só podem inserir registro com seu próprio auth.uid()
  - Role 'admin' só pode ser criado quando não há admins no sistema
  - Outros roles precisam aprovação (status 'pending')
*/

-- 1. Remover políticas antigas de INSERT se existirem
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "First admin can be created" ON users;

-- 2. Adicionar política para INSERT de usuários comuns
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    role != 'admin' AND
    status = 'pending'
  );

-- 3. Adicionar política para INSERT de primeiro admin
-- Permite criar admin APENAS se não existir nenhum admin no sistema
CREATE POLICY "First admin can be created"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    role = 'admin' AND
    NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin')
  );

-- 4. Limpar usuários órfãos do auth.users
-- Remove usuários que foram criados no auth mas não na tabela users
DO $$
DECLARE
  orphan_user RECORD;
BEGIN
  FOR orphan_user IN 
    SELECT au.id 
    FROM auth.users au 
    LEFT JOIN users u ON au.id = u.id 
    WHERE u.id IS NULL
  LOOP
    -- Deletar do auth.users
    DELETE FROM auth.users WHERE id = orphan_user.id;
  END LOOP;
END $$;
