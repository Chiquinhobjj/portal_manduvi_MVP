# Guia para Criar Conta de Administrador

## Dados da Conta

- **Nome:** Francisco Jose Pessoa Fernandes Junior
- **Email:** chiquinhopfernandes@gmail.com
- **Senha:** Joao200800
- **Perfil:** Administrador (super)

---

## Método 1: Via Supabase Dashboard (RECOMENDADO)

### Passo 1: Criar o Usuário no Auth

1. Acesse o Supabase Dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. No menu lateral, vá em **Authentication** → **Users**
3. Clique em **"Add user"** (botão verde no canto superior direito)
4. Preencha o formulário:
   - **Email:** `chiquinhopfernandes@gmail.com`
   - **Password:** `Joao200800`
   - **Auto Confirm User:** ✅ **MARQUE ESTA OPÇÃO** (importante!)
5. Clique em **"Create user"**
6. **COPIE o UUID** do usuário que aparecerá na lista (algo como: `123e4567-e89b-12d3-a456-426614174000`)

### Passo 2: Inserir Dados nas Tabelas

1. No menu lateral, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o SQL abaixo, **SUBSTITUINDO** `UUID_DO_USUARIO` pelo UUID que você copiou:

```sql
-- Substitua UUID_DO_USUARIO pelo UUID real em todos os lugares abaixo

-- 1. Criar registro na tabela users
INSERT INTO users (id, email, role, status, email_verified, profile_completed, metadata)
VALUES (
  'UUID_DO_USUARIO',  -- ⚠️ SUBSTITUA AQUI
  'chiquinhopfernandes@gmail.com',
  'admin',
  'active',
  true,
  true,
  '{}'::jsonb
);

-- 2. Criar perfil de administrador
INSERT INTO admin_profiles (user_id, full_name, access_level, department, permissions_override, notes)
VALUES (
  'UUID_DO_USUARIO',  -- ⚠️ SUBSTITUA AQUI
  'Francisco Jose Pessoa Fernandes Junior',
  'super',
  'Administração',
  '{}'::jsonb,
  'Conta de administrador principal'
);

-- 3. Configurar preferências de notificação
INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, sms_enabled, frequency)
VALUES (
  'UUID_DO_USUARIO',  -- ⚠️ SUBSTITUA AQUI
  true,
  true,
  false,
  'immediate'
);
```

4. Clique em **"Run"** para executar
5. Se tudo correr bem, você verá "Success. No rows returned"

---

## Método 2: Via SQL Editor (Tudo de Uma Vez)

Se você preferir fazer tudo via SQL, siga estes passos:

### Passo Único: Execute no SQL Editor

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor** → **New query**
3. Cole este SQL e execute:

```sql
-- ATENÇÃO: Este método requer permissões especiais na tabela auth.users
-- Se der erro, use o Método 1

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Gerar um novo UUID para o usuário
  new_user_id := gen_random_uuid();

  -- Criar usuário na tabela users
  INSERT INTO users (id, email, role, status, email_verified, profile_completed, metadata)
  VALUES (
    new_user_id,
    'chiquinhopfernandes@gmail.com',
    'admin',
    'active',
    true,
    true,
    '{}'::jsonb
  );

  -- Criar perfil de administrador
  INSERT INTO admin_profiles (user_id, full_name, access_level, department, permissions_override, notes)
  VALUES (
    new_user_id,
    'Francisco Jose Pessoa Fernandes Junior',
    'super',
    'Administração',
    '{}'::jsonb,
    'Conta de administrador principal'
  );

  -- Configurar preferências de notificação
  INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, sms_enabled, frequency)
  VALUES (
    new_user_id,
    true,
    true,
    false,
    'immediate'
  );

  -- Mostrar o UUID criado
  RAISE NOTICE 'Usuário criado com UUID: %', new_user_id;
END $$;
```

**IMPORTANTE:** Após executar este método, você ainda precisa:
1. Criar o usuário manualmente no Auth (método 1, passo 1)
2. Usar o MESMO UUID que foi gerado aqui

---

## Verificar se Funcionou

### Teste 1: Verificar no Dashboard

1. Vá em **Authentication** → **Users**
2. Procure pelo email: `chiquinhopfernandes@gmail.com`
3. Verifique se o status está como **"Confirmed"**

### Teste 2: Verificar nas Tabelas

Execute no SQL Editor:

```sql
-- Verificar se o usuário existe
SELECT id, email, role, status
FROM users
WHERE email = 'chiquinhopfernandes@gmail.com';

-- Verificar o perfil de admin
SELECT user_id, full_name, access_level
FROM admin_profiles
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'chiquinhopfernandes@gmail.com'
);
```

### Teste 3: Fazer Login na Aplicação

1. Acesse a aplicação
2. Vá para a página de login
3. Use as credenciais:
   - **Email:** chiquinhopfernandes@gmail.com
   - **Senha:** Joao200800
4. Após o login, você deve ter acesso à página de administração em `/admin/users`

---

## Solução de Problemas

### Erro: "duplicate key value violates unique constraint"

Significa que já existe um usuário com este email. Para verificar:

```sql
SELECT * FROM users WHERE email = 'chiquinhopfernandes@gmail.com';
```

Se já existe, você pode atualizar a senha dele no Dashboard de Auth.

### Erro ao fazer login: "Invalid login credentials"

1. Verifique se o usuário foi criado no Auth (Authentication → Users)
2. Verifique se a opção "Auto Confirm User" foi marcada
3. Tente resetar a senha no Dashboard

### Erro: "User not found" ou sem permissões de admin

Verifique se o role está correto:

```sql
UPDATE users
SET role = 'admin', status = 'active'
WHERE email = 'chiquinhopfernandes@gmail.com';
```

---

## Contato

Se tiver problemas, verifique:
1. Se todas as migrations foram aplicadas
2. Se as tabelas `users`, `admin_profiles` e `notification_preferences` existem
3. Se o RLS (Row Level Security) está configurado corretamente
