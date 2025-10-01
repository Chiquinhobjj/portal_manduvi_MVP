# 💡 Exemplos Práticos de Uso

Este documento mostra exemplos práticos de como usar o sistema de autenticação.

---

## 📋 Cenário 1: Primeiro Dia - Configurando o Sistema

### Situação:
Você acabou de clonar o projeto e quer começar a usar.

### Passo a Passo:

```bash
# 1. Instalar dependências
npm install

# 2. Verificar arquivo .env (já configurado)
cat .env

# 3. Iniciar o servidor
npm run dev

# 4. Abrir no navegador
# http://localhost:5173/setup
```

### Na página /setup:

```
Nome Completo: João da Silva
Email: joao.silva@manduvi.org
Departamento: Administração
Senha: senha123456
Confirmar Senha: senha123456

[Criar Administrador]
```

### Resultado:
✅ Primeiro administrador criado
✅ Redirecionado para /login
✅ Pode fazer login com joao.silva@manduvi.org

---

## 📋 Cenário 2: Empresa Quer se Cadastrar

### Situação:
Uma empresa chamada "TechCorp" quer se cadastrar no sistema.

### Passo a Passo:

**1. Acessar:** http://localhost:5173/register

**2. Escolher perfil:** Clicar no card "Empresa"

**3. Preencher dados:**
```
Email: contato@techcorp.com.br
Senha: TechCorp2024!
Confirmar Senha: TechCorp2024!
☑ Aceito os termos e condições
```

**4. Clicar em:** "Criar Conta"

### Resultado:
✅ Conta criada com status "Pendente"
⏳ Aguardando aprovação do administrador
📧 Usuário pode tentar fazer login, mas receberá erro até ser aprovado

---

## 📋 Cenário 3: Admin Aprovando Novos Usuários

### Situação:
Você é admin e precisa aprovar 3 novas contas pendentes.

### Passo a Passo:

**1. Fazer login como admin:**
```
http://localhost:5173/login
Email: joao.silva@manduvi.org
Senha: senha123456
```

**2. Acessar gerenciamento:**
```
http://localhost:5173/admin/users
```

**3. Filtrar pendentes:**
- No dropdown "Status", selecionar "Pendente"
- Você verá algo assim:

```
┌──────────────────────────────────────────────────────────┐
│ Usuário                │ Perfil        │ Status          │
├──────────────────────────────────────────────────────────┤
│ contato@techcorp.com   │ Empresa       │ ⏳ Pendente     │
│ ong@meioambiente.org   │ Terceiro Set. │ ⏳ Pendente     │
│ maria@exemplo.com      │ Usuário       │ ⏳ Pendente     │
└──────────────────────────────────────────────────────────┘
```

**4. Aprovar cada um:**
- Clicar em "Aprovar" ao lado de cada usuário
- Status muda para "✅ Ativo"

### Resultado:
✅ 3 usuários aprovados
✅ Eles recebem notificação
✅ Agora podem fazer login

---

## 📋 Cenário 4: Usuário Fazendo Login pela Primeira Vez

### Situação:
Maria foi aprovada e quer fazer login.

### Passo a Passo:

**1. Recebeu notificação:**
```
"Sua conta foi ativada"
```

**2. Acessar login:**
```
http://localhost:5173/login
Email: maria@exemplo.com
Senha: (senha dela)
```

**3. Clicar em "Entrar"**

### Resultado:
✅ Login bem-sucedido
✅ Redirecionada para /dashboard
✅ Vê painel de usuário com suas estatísticas

---

## 📋 Cenário 5: Suspendendo Usuário Problemático

### Situação:
Um usuário está violando regras e precisa ser suspenso temporariamente.

### Passo a Passo:

**1. Admin acessa:** http://localhost:5173/admin/users

**2. Buscar usuário:**
```
[🔍 Buscar por email...]
Digite: usuario@problema.com
```

**3. Encontrar na lista:**
```
┌──────────────────────────────────────────────────────────┐
│ usuario@problema.com   │ Usuário    │ ✅ Ativo           │
│                        │            │ [Suspender]        │
└──────────────────────────────────────────────────────────┘
```

**4. Clicar em "Suspender"**

### Resultado:
✅ Status muda para "❌ Suspenso"
✅ Usuário não pode mais fazer login
✅ Usuário recebe notificação: "Sua conta foi suspensa"

---

## 📋 Cenário 6: Reativando Usuário

### Situação:
O usuário resolveu o problema e pode voltar.

### Passo a Passo:

**1. Admin acessa:** http://localhost:5173/admin/users

**2. Filtrar suspensos:**
```
Dropdown "Status" → Selecionar "Suspenso"
```

**3. Encontrar usuário:**
```
┌──────────────────────────────────────────────────────────┐
│ usuario@problema.com   │ Usuário    │ ❌ Suspenso        │
│                        │            │ [Reativar]         │
└──────────────────────────────────────────────────────────┘
```

**4. Clicar em "Reativar"**

### Resultado:
✅ Status volta para "✅ Ativo"
✅ Usuário pode fazer login novamente
✅ Usuário recebe notificação: "Sua conta foi ativada"

---

## 📋 Cenário 7: Gerenciando Múltiplas Empresas

### Situação:
Admin precisa revisar todas as empresas cadastradas.

### Passo a Passo:

**1. Acessar:** http://localhost:5173/admin/users

**2. Filtrar por perfil:**
```
Dropdown "Perfil" → Selecionar "Empresa"
```

**3. Ver lista filtrada:**
```
┌──────────────────────────────────────────────────────────┐
│ Email                  │ Perfil     │ Status    │ Ações  │
├──────────────────────────────────────────────────────────┤
│ contato@techcorp.com   │ Empresa    │ ✅ Ativo  │ [...] │
│ admin@startupxyz.com   │ Empresa    │ ⏳ Pend.  │ [...] │
│ info@megacorp.com.br   │ Empresa    │ ✅ Ativo  │ [...] │
└──────────────────────────────────────────────────────────┘
```

**4. Aprovar pendentes:**
- Clicar em "Aprovar" nas empresas pendentes

### Resultado:
✅ Visão geral de todas as empresas
✅ Fácil aprovação em massa
✅ Controle centralizado

---

## 📋 Cenário 8: Busca Rápida de Usuário

### Situação:
Admin precisa encontrar rapidamente um usuário específico.

### Passo a Passo:

**1. Acessar:** http://localhost:5173/admin/users

**2. Usar busca:**
```
[🔍 Buscar por email...]
Digite: maria
```

**3. Resultados instantâneos:**
```
┌──────────────────────────────────────────────────────────┐
│ maria@exemplo.com      │ Usuário    │ ✅ Ativo          │
│ maria.silva@ong.org    │ Terceiro S.│ ⏳ Pendente       │
│ mariana@empresa.com    │ Empresa    │ ✅ Ativo          │
└──────────────────────────────────────────────────────────┘
```

### Resultado:
✅ Busca em tempo real
✅ Encontra por parte do email
✅ Rápido e eficiente

---

## 📋 Cenário 9: Dashboard do Admin

### Situação:
Admin quer ver estatísticas gerais do sistema.

### Passo a Passo:

**1. Fazer login como admin**

**2. Acessar:** http://localhost:5173/dashboard

**3. Ver estatísticas:**
```
┌─────────────────────────────────────────────────┐
│ 👥 Total de Usuários        │ 127              │
│ 📄 Total de Editais         │ 45               │
│ 📊 Candidaturas             │ 89               │
│ ✅ Usuários Ativos          │ 98               │
│ ⚠️  Pendentes               │ 15               │
│ 📅 Novos este Mês           │ 23               │
└─────────────────────────────────────────────────┘

Acesso Rápido:
• Gerenciar Usuários
• Gerenciar Editais
• Revisar Candidaturas
• Campos Personalizados
• Analytics Avançados
• Configurações
```

### Resultado:
✅ Visão geral completa
✅ Acesso rápido a funcionalidades
✅ Monitoramento do sistema

---

## 📋 Cenário 10: Dashboard do Usuário Comum

### Situação:
Maria fez login e quer ver seu painel.

### Passo a Passo:

**1. Fazer login como usuário**

**2. Acessar:** http://localhost:5173/dashboard

**3. Ver estatísticas pessoais:**
```
┌─────────────────────────────────────────────────┐
│ 📄 Minhas Candidaturas      │ 5                │
│ ⏳ Aguardando Resposta      │ 2                │
│ 📈 Taxa de Sucesso          │ 60%              │
└─────────────────────────────────────────────────┘

Ações Rápidas:
• Explorar Editais
• Meu Perfil
• Minhas Candidaturas
• Favoritos
```

### Resultado:
✅ Dashboard personalizado
✅ Estatísticas próprias
✅ Ações relevantes para usuário

---

## 🎯 Resumo dos Casos de Uso

| Cenário | Quem | O Que Faz |
|---------|------|-----------|
| 1 | Desenvolvedor | Configura sistema pela primeira vez |
| 2 | Empresa | Se cadastra no sistema |
| 3 | Admin | Aprova usuários pendentes |
| 4 | Usuário | Faz primeiro login |
| 5 | Admin | Suspende usuário |
| 6 | Admin | Reativa usuário |
| 7 | Admin | Gerencia empresas |
| 8 | Admin | Busca usuário específico |
| 9 | Admin | Visualiza dashboard |
| 10 | Usuário | Visualiza dashboard pessoal |

---

## 💡 Dicas Práticas

### Para Admins:
✅ Aprove usuários regularmente
✅ Use filtros para organizar
✅ Revise usuários suspensos periodicamente
✅ Monitore estatísticas no dashboard

### Para Usuários:
✅ Escolha o perfil correto ao se cadastrar
✅ Use email válido (notificações importantes)
✅ Aguarde aprovação pacientemente
✅ Atualize seu perfil após primeiro login

### Para Desenvolvedores:
✅ Sempre faça backup do .env
✅ Teste cada tipo de perfil
✅ Verifique logs de auditoria
✅ Monitore sessões ativas

---

## 🔗 Links Relacionados

- [COMO_USAR.md](COMO_USAR.md) - Guia rápido
- [GUIA_AUTENTICACAO.md](GUIA_AUTENTICACAO.md) - Guia completo
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md) - Documentação técnica

---

**Pronto para usar! 🚀**
