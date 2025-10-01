/*
  # Corrigir Todas as Políticas com Recursão

  ## Problema
  - Políticas que verificam role='admin' consultando a própria tabela users
  - Causa recursão infinita em SELECT e UPDATE

  ## Solução
  - Remover políticas que causam recursão
  - Criar políticas mais simples sem subconsultas recursivas
  - Usar apenas auth.uid() sem consultar a tabela users novamente

  ## Mudanças
  1. Remover políticas com EXISTS que consultam users
  2. Criar políticas baseadas apenas em auth.uid() 
  3. Controle de admin será feito na aplicação
*/

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- 2. Criar políticas sem recursão

-- SELECT: usuários podem ler seus próprios dados
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE: usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Nota: Políticas de admin serão controladas via service_role na aplicação
-- Isso evita recursão e mantém melhor controle
