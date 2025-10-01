# Guia de Autenticação - Sistema Manduvi

Este guia explica como cadastrar usuários, fazer login e criar administradores no sistema.

## 📋 Índice

1. [Primeiro Acesso - Criar Administrador](#primeiro-acesso)
2. [Cadastro de Usuários](#cadastro-de-usuários)
3. [Login no Sistema](#login-no-sistema)
4. [Gerenciamento de Usuários (Admin)](#gerenciamento-admin)

---

## 🔐 Primeiro Acesso - Criar Administrador {#primeiro-acesso}

Na primeira vez que o sistema é acessado, você precisa criar a conta de administrador:

### Passo a Passo:

1. **Acesse a página de configuração inicial:**
   ```
   http://localhost:5173/setup
   ```

2. **Preencha o formulário:**
   - **Nome Completo**: Seu nome completo
   - **Email**: Seu email (será usado para login)
   - **Departamento**: (Opcional) Seu departamento ou setor
   - **Senha**: Mínimo de 6 caracteres
   - **Confirmar Senha**: Repita a mesma senha

3. **Clique em "Criar Administrador"**

4. **Você será redirecionado para a página de login** após 3 segundos

⚠️ **IMPORTANTE**: Esta página só funcionará se ainda não existir nenhum administrador no sistema. Depois que o primeiro admin é criado, a página mostrará uma mensagem informando que o sistema já está configurado.

---

## 👤 Cadastro de Usuários {#cadastro-de-usuários}

Qualquer pessoa pode se cadastrar no sistema escolhendo um dos 5 tipos de perfil disponíveis.

### Tipos de Perfil:

1. **👤 Usuário**: Pessoa física interessada em acompanhar editais e iniciativas
2. **🏢 Empresa**: Empresas privadas interessadas em parcerias e editais
3. **👥 Terceiro Setor**: ONGs, OSCIPs e organizações da sociedade civil
4. **🛡️ Órgão Público**: Instituições governamentais e autarquias
5. **💼 Colaborador**: Profissionais e consultores independentes

### Passo a Passo:

1. **Acesse a página de registro:**
   ```
   http://localhost:5173/register
   ```
   Ou clique em "Cadastre-se" na página de login

2. **Selecione seu tipo de perfil:**
   - Leia as descrições de cada perfil
   - Clique no card do perfil que melhor descreve você

3. **Preencha seus dados:**
   - **Email**: Seu endereço de email
   - **Senha**: Mínimo de 6 caracteres
   - **Confirmar Senha**: Repita a mesma senha
   - **Aceite os termos**: Marque a caixa de aceite

4. **Clique em "Criar Conta"**

5. **Aguarde aprovação:**
   - Sua conta será criada com status "Pendente"
   - Um administrador precisa aprovar sua conta
   - Você receberá uma notificação quando for aprovado

---

## 🔑 Login no Sistema {#login-no-sistema}

### Passo a Passo:

1. **Acesse a página de login:**
   ```
   http://localhost:5173/login
   ```

2. **Preencha suas credenciais:**
   - **Email**: O email que você cadastrou
   - **Senha**: Sua senha

3. **Clique em "Entrar"**

4. **Você será redirecionado para o Dashboard**

### Status da Conta:

- ✅ **Ativo**: Pode fazer login normalmente
- ⏳ **Pendente**: Aguardando aprovação do administrador (não pode fazer login)
- ❌ **Suspenso**: Conta suspensa (não pode fazer login)

---

## 👨‍💼 Gerenciamento de Usuários (Admin) {#gerenciamento-admin}

Apenas administradores têm acesso a esta funcionalidade.

### Acessar Painel de Usuários:

1. **Faça login como administrador**

2. **Acesse o Dashboard:**
   ```
   http://localhost:5173/dashboard
   ```

3. **Clique em "Gerenciar Usuários"** ou acesse diretamente:
   ```
   http://localhost:5173/admin/users
   ```

### Funcionalidades Disponíveis:

#### 🔍 Buscar e Filtrar

- **Busca por email**: Digite no campo de busca
- **Filtrar por perfil**: Selecione o tipo de perfil desejado
- **Filtrar por status**: Selecione o status (Pendente, Ativo, Suspenso)

#### ✅ Aprovar Usuários Pendentes

1. Encontre o usuário com status "Pendente"
2. Clique no botão "Aprovar"
3. O usuário receberá uma notificação e poderá fazer login

#### ⏸️ Suspender Usuários

1. Encontre o usuário ativo
2. Clique no botão "Suspender"
3. O usuário não poderá mais fazer login até ser reativado

#### 🔄 Reativar Usuários Suspensos

1. Encontre o usuário suspenso
2. Clique no botão "Reativar"
3. O usuário poderá fazer login novamente

### Informações Exibidas:

Para cada usuário, você verá:

- **Email e ID**: Identificação do usuário
- **Perfil**: Tipo de conta (Admin, Empresa, etc.)
- **Status**: Estado atual da conta
- **Data de Cadastro**: Quando o usuário se registrou

---

## 🎯 Resumo Rápido

### Para Criar o Primeiro Admin:
```
1. Acesse: /setup
2. Preencha: Nome, Email, Senha
3. Clique: "Criar Administrador"
4. Login: Use o email e senha criados
```

### Para Cadastrar Novo Usuário:
```
1. Acesse: /register
2. Escolha: Tipo de perfil
3. Preencha: Email, Senha
4. Aguarde: Aprovação do admin
```

### Para Fazer Login:
```
1. Acesse: /login
2. Digite: Email e Senha
3. Entre: No sistema
```

### Para Gerenciar Usuários (Admin):
```
1. Login: Como administrador
2. Acesse: /admin/users
3. Aprove: Usuários pendentes
4. Gerencie: Status dos usuários
```

---

## ❓ Perguntas Frequentes

**Q: Posso criar vários administradores?**
A: Sim! Um administrador pode promover outros usuários a admin através do painel de gerenciamento.

**Q: Esqueci minha senha, o que faço?**
A: Atualmente, entre em contato com um administrador para redefinir sua senha.

**Q: Posso mudar meu tipo de perfil depois?**
A: Não diretamente. Um administrador pode fazer isso através do banco de dados.

**Q: Quanto tempo demora para minha conta ser aprovada?**
A: Depende da disponibilidade dos administradores. Você receberá uma notificação assim que for aprovado.

**Q: O que acontece se minha conta for suspensa?**
A: Você não poderá fazer login até que um administrador reative sua conta.

---

## 🔒 Segurança

- ✅ Todas as senhas são criptografadas
- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Sessões são rastreadas e registradas
- ✅ Auditoria de todas as ações importantes
- ✅ Notificações sobre mudanças de status

---

## 📞 Suporte

Para problemas técnicos ou dúvidas, entre em contato com a equipe de desenvolvimento.
