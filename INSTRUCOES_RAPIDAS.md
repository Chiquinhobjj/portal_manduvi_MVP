# 🚀 INSTRUÇÕES RÁPIDAS - COMECE AQUI!

## ⚠️ IMPORTANTE: Você precisa criar o primeiro administrador!

Parece que você ainda não criou nenhum usuário no sistema. Siga estes passos:

---

## 📝 PASSO 1: Criar o Primeiro Admin

### 1. Abra seu navegador e acesse:

```
http://localhost:5173/setup
```

### 2. Você verá esta tela:

```
┌─────────────────────────────────────────────┐
│            🛡️ Configuração Inicial           │
│                                             │
│  Crie a primeira conta de administrador    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Nome Completo: [____________]       │   │
│  │ Email:         [____________]       │   │
│  │ Departamento:  [____________]       │   │
│  │ Senha:         [____________]       │   │
│  │ Confirmar:     [____________]       │   │
│  │                                     │   │
│  │  [  Criar Administrador  ]          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 3. Preencha os campos:

```
Nome Completo: João Silva
Email: admin@manduvi.org
Departamento: TI
Senha: admin123456
Confirmar Senha: admin123456
```

### 4. Clique no botão "Criar Administrador"

### 5. Você verá uma mensagem de sucesso e será redirecionado para o login

---

## 📝 PASSO 2: Fazer Login

### 1. Na tela de login, digite:

```
Email: admin@manduvi.org
Senha: admin123456
```

### 2. Clique em "Entrar"

---

## 📝 PASSO 3: Verificar que Está Logado

### Depois do login, você verá no canto superior direito:

```
┌──────────────────────────────────┐
│  🌙  🌐 PT  👤 admin  ▼          │
└──────────────────────────────────┘
```

### Clique no nome do usuário (👤 admin ▼) e verá:

```
┌─────────────────────────────┐
│ admin@manduvi.org          │
│ admin                      │
├─────────────────────────────┤
│ Dashboard                  │
│ Gerenciar Usuários         │ ← ISSO APARECE SE VOCÊ É ADMIN
│ Perfil                     │
├─────────────────────────────┤
│ 🚪 Sair                    │
└─────────────────────────────┘
```

---

## 📝 PASSO 4: Acessar Painel de Administração

### Clique em "Gerenciar Usuários" ou acesse diretamente:

```
http://localhost:5173/admin/users
```

---

## ❓ Problemas Comuns

### "A página /setup mostra 'Sistema já configurado'"
✅ **Solução:** Já existe um admin. Vá direto para o login: http://localhost:5173/login

### "Não vejo 'Gerenciar Usuários' no menu"
⚠️ **Possíveis causas:**
1. Você não criou o admin ainda → Vá para /setup
2. Você não está logado → Vá para /login
3. Seu usuário não é admin → Só admins veem essa opção

### "Não consigo acessar /setup"
✅ **Solução:** Certifique-se de que o servidor está rodando:
```bash
npm run dev
```

### "Aparece erro ao criar admin"
✅ **Solução:** Verifique o console do navegador (F12) e me mostre o erro

---

## 🔍 Como Verificar se Deu Certo

### 1. Você está logado?
- Olhe no canto superior direito
- Deve aparecer seu nome/email com um ícone de usuário

### 2. Você é admin?
- Clique no seu nome
- Deve aparecer "admin" como seu role
- Deve ter a opção "Gerenciar Usuários"

### 3. Consegue acessar painel admin?
- Tente acessar: http://localhost:5173/admin/users
- Se funcionar, você é admin!

---

## 📊 Estrutura Visual do Sistema

```
┌─────────────────────────────────────────────────────┐
│                    NAVBAR                           │
│  Manduvi  [Menu]  [Busca]  🌙  🌐  👤 admin ▼      │
└─────────────────────────────────────────────────────┘
                          │
                          ▼ Clica aqui
            ┌─────────────────────────────┐
            │ admin@manduvi.org          │
            │ admin                      │
            ├─────────────────────────────┤
            │ Dashboard                  │ → /dashboard
            │ Gerenciar Usuários         │ → /admin/users ⭐
            │ Perfil                     │ → /profile
            ├─────────────────────────────┤
            │ 🚪 Sair                    │
            └─────────────────────────────┘
```

---

## 🎯 RESUMÃO EM 3 PASSOS

```
1️⃣  localhost:5173/setup
    ↓ Criar admin

2️⃣  localhost:5173/login
    ↓ Fazer login

3️⃣  Clicar em 👤 admin → Gerenciar Usuários
    ✅ PRONTO!
```

---

## 📞 Ainda com Problemas?

Me envie:
1. Uma captura de tela da página que você está vendo
2. O que aparece no console do navegador (pressione F12)
3. A URL que está na barra de endereços

---

**Comece pelo PASSO 1 agora! 🚀**
