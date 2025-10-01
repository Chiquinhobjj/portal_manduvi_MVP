# 🚀 Como Usar o Sistema - Guia Rápido

## 1️⃣ Primeira Configuração - Criar Admin

**Acesse:** http://localhost:5173/setup

1. Preencha seu nome completo
2. Digite seu email (você usará para login)
3. Crie uma senha (mínimo 6 caracteres)
4. Clique em "Criar Administrador"
5. Você será redirecionado para o login

✅ **Pronto!** Seu primeiro administrador foi criado.

---

## 2️⃣ Fazer Login como Admin

**Acesse:** http://localhost:5173/login

1. Digite o email que você cadastrou
2. Digite sua senha
3. Clique em "Entrar"

✅ **Pronto!** Você está no sistema como administrador.

---

## 3️⃣ Cadastrar Novos Usuários

**Acesse:** http://localhost:5173/register

1. **Escolha o tipo de perfil:**
   - 👤 Usuário
   - 🏢 Empresa
   - 👥 Terceiro Setor
   - 🛡️ Órgão Público
   - 💼 Colaborador

2. **Preencha os dados:**
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirme a senha
   - Aceite os termos

3. Clique em "Criar Conta"

⚠️ **Atenção:** A conta ficará "Pendente" até ser aprovada por um admin.

---

## 4️⃣ Gerenciar Usuários (Admin)

**Acesse:** http://localhost:5173/admin/users

### O que você pode fazer:

✅ **Aprovar usuários pendentes**
- Encontre usuários com status "Pendente"
- Clique em "Aprovar"

⏸️ **Suspender usuários**
- Encontre usuários ativos
- Clique em "Suspender"

🔄 **Reativar usuários**
- Encontre usuários suspensos
- Clique em "Reativar"

🔍 **Buscar e filtrar**
- Use a barra de busca para encontrar por email
- Filtre por tipo de perfil
- Filtre por status

---

## 📊 Estrutura de Perfis

| Perfil | Descrição | Status Inicial |
|--------|-----------|----------------|
| **Admin** | Controle total do sistema | Ativo (criado via /setup) |
| **Usuário** | Pessoa física | Pendente (precisa aprovação) |
| **Empresa** | Empresas privadas | Pendente (precisa aprovação) |
| **Terceiro Setor** | ONGs e OSCIPs | Pendente (precisa aprovação) |
| **Órgão Público** | Instituições governamentais | Pendente (precisa aprovação) |
| **Colaborador** | Profissionais independentes | Pendente (precisa aprovação) |

---

## 🔐 Status das Contas

- ⏳ **Pendente**: Aguardando aprovação (não pode fazer login)
- ✅ **Ativo**: Pode fazer login e usar o sistema
- ❌ **Suspenso**: Temporariamente bloqueado (não pode fazer login)

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│  1. Primeiro acesso: /setup → Criar Admin               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Admin faz login: /login                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Usuários se cadastram: /register                    │
│     Status: PENDENTE                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. Admin aprova usuários: /admin/users                 │
│     Status: PENDENTE → ATIVO                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. Usuários fazem login: /login                        │
│     Acesso ao dashboard e funcionalidades               │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Comandos Úteis

### Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

### Criar build de produção:
```bash
npm run build
```

### Verificar erros de TypeScript:
```bash
npm run typecheck
```

---

## 📝 URLs Importantes

| Página | URL | Descrição |
|--------|-----|-----------|
| Setup Inicial | `/setup` | Criar primeiro admin |
| Login | `/login` | Fazer login no sistema |
| Registro | `/register` | Cadastrar novo usuário |
| Dashboard | `/dashboard` | Painel principal |
| Gerenciar Usuários | `/admin/users` | Administração de usuários |

---

## 🆘 Problemas Comuns

### "Email ou senha inválidos"
- Verifique se digitou corretamente
- Confirme que sua conta está ATIVA (não pendente ou suspensa)

### "Sistema já configurado" na página /setup
- Isso significa que já existe um admin
- Use a página `/login` para entrar

### Não consigo fazer login após me cadastrar
- Sua conta pode estar PENDENTE
- Peça para um admin aprovar sua conta em `/admin/users`

### Esqueci minha senha
- Entre em contato com um administrador
- Ele pode criar uma nova senha para você

---

## 🔒 Segurança

✅ Senhas criptografadas
✅ Row Level Security (RLS) ativo
✅ Auditoria de ações
✅ Sessões rastreadas
✅ Notificações de mudanças

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `GUIA_AUTENTICACAO.md` - Guia completo de autenticação
- `AUTH_SYSTEM.md` - Documentação técnica do sistema

---

## 🎉 Pronto para Começar!

1. Execute `npm run dev`
2. Acesse http://localhost:5173/setup
3. Crie sua conta de administrador
4. Comece a usar o sistema!

**Boa sorte! 🚀**
