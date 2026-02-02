# Vya Nexus - Checklist de Validação para Windows

## ✅ Pré-requisitos

- [ ] Node.js v20+ instalado
- [ ] pnpm 10.4.1+ instalado
- [ ] MySQL 8.0+ rodando localmente
- [ ] Git instalado
- [ ] Arquivo `.env` criado na raiz do projeto

---

## 🔍 Teste 1: Verificar Variáveis de Ambiente

### Passo 1: Verificar arquivo `.env`

```powershell
# Verificar se .env existe
Test-Path .env

# Resultado esperado: True
```

### Passo 2: Verificar conteúdo do `.env`

```powershell
# Ver conteúdo (sem mostrar valores sensíveis)
Get-Content .env | Select-String "VITE_APP_ID|VITE_OAUTH_PORTAL_URL|DATABASE_URL"

# Resultado esperado:
# VITE_APP_ID=seu_app_id_aqui
# VITE_OAUTH_PORTAL_URL=https://portal.manus.im
# DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
```

### Passo 3: Verificar se Vite carrega as variáveis

```powershell
# Iniciar servidor
pnpm dev

# Em outro terminal, abrir http://localhost:3000
# Abrir Console (F12)
# Digitar:
# console.log(import.meta.env.VITE_APP_ID)
# console.log(import.meta.env.VITE_OAUTH_PORTAL_URL)

# Resultado esperado: Valores aparecem no console (não undefined)
```

**Se retornar `undefined`:**
- [ ] Verifique se `.env` está na **raiz** do projeto
- [ ] Reinicie o servidor: `pnpm dev`
- [ ] Limpe cache: `Ctrl+Shift+Delete` no navegador

---

## 🔍 Teste 2: Verificar Banco de Dados

### Passo 1: Conectar ao MySQL

```powershell
# Conectar
mysql -u root -p -h localhost

# Dentro do MySQL, verificar banco
SHOW DATABASES;

# Resultado esperado: vya_nexus deve aparecer na lista
```

### Passo 2: Verificar tabelas

```powershell
# Dentro do MySQL
USE vya_nexus;
SHOW TABLES;

# Resultado esperado: 15 tabelas devem aparecer:
# - users
# - tenants
# - subscriptions
# - files
# - domains
# - emailAccounts
# - hostedSites
# - notifications
# - chatConversations
# - chatMessages
# - plans
# - supportTickets
# - accountUpgrades
# - invoices
# - affiliates
```

### Passo 3: Verificar dados iniciais

```powershell
# Dentro do MySQL
SELECT COUNT(*) FROM plans;

# Resultado esperado: 5 (cinco planos)
```

**Se retornar 0:**
- [ ] Execute: `pnpm db:seed`
- [ ] Verifique se o script rodou sem erros

---

## 🔍 Teste 3: Verificar Servidor Backend

### Passo 1: Iniciar servidor

```powershell
pnpm dev

# Resultado esperado:
# [OAuth] Initialized with baseURL: https://api.manus.im
# Server running on http://localhost:3000/
```

### Passo 2: Testar endpoint de health check

```powershell
# Em outro terminal PowerShell
curl http://localhost:3000/api/health

# Ou via Invoke-WebRequest
Invoke-WebRequest -Uri http://localhost:3000/api/health
```

**Se retornar erro de conexão:**
- [ ] Verifique se o servidor está rodando
- [ ] Verifique se a porta 3000 está disponível: `netstat -ano | findstr :3000`

---

## 🔍 Teste 4: Verificar Frontend

### Passo 1: Abrir navegador

```
http://localhost:3000
```

### Passo 2: Verificar se página carrega sem erro

**Resultado esperado:**
- [ ] Página branca com triângulo vermelho **NÃO** deve aparecer
- [ ] Página deve mostrar "Bem-vindo de volta!" ou botão "Entrar com Manus"
- [ ] Console (F12) deve estar limpo (sem erros de "Invalid URL")

### Passo 3: Verificar se variáveis estão carregadas

```javascript
// No console do navegador (F12):
console.log(import.meta.env.VITE_APP_ID)
console.log(import.meta.env.VITE_OAUTH_PORTAL_URL)
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Resultado esperado: Todos os valores devem aparecer (não undefined)
```

---

## 🔍 Teste 5: Verificar Scripts de Desenvolvimento Separado

### Passo 1: Testar script de servidor

```powershell
# Terminal 1
.\dev-server.bat

# Resultado esperado:
# [INFO] Iniciando servidor em http://localhost:3000
# Server running on http://localhost:3000/
```

### Passo 2: Testar script de cliente

```powershell
# Terminal 2
.\dev-client.bat

# Resultado esperado:
# [INFO] Iniciando cliente em http://localhost:5173
# VITE v7.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Passo 3: Testar acesso ao cliente

```
http://localhost:5173
```

**Resultado esperado:**
- [ ] Página carrega sem erro "Invalid URL"
- [ ] Botão "Entrar com Manus" aparece
- [ ] Console limpo (sem erros)

---

## 🔍 Teste 6: Verificar Seed de Dados

### Passo 1: Executar seed

```powershell
pnpm db:seed

# Resultado esperado:
# 🔗 Conectando ao banco de dados: localhost:3306/vya_nexus
# ✅ Conectado ao banco de dados
# 📋 Inserindo planos comerciais...
#   ✓ Vya Solo - R$ 29.90
#   ✓ Starter 5 - R$ 99.90
#   ✓ Starter 10 - R$ 189.90
#   ✓ Vya Pro - R$ 199.90
#   ✓ Standard 1TB - R$ 149.90
# ✅ Seed concluído com sucesso!
```

### Passo 2: Verificar dados no banco

```powershell
# Dentro do MySQL
SELECT name, priceMonthCents FROM plans;

# Resultado esperado:
# Vya Solo        | 2990
# Starter 5       | 9990
# Starter 10      | 18990
# Vya Pro         | 19990
# Standard 1TB    | 14990
```

---

## 🔍 Teste 7: Verificar Migrações do Banco

### Passo 1: Executar migrações

```powershell
pnpm db:push

# Resultado esperado:
# ✔ Drizzle generated migrations
# ✔ Migrations applied successfully
```

### Passo 2: Verificar schema

```powershell
# Dentro do MySQL
USE vya_nexus;
DESCRIBE users;

# Resultado esperado: Colunas devem aparecer:
# id, openId, name, email, loginMethod, role, tenantId, createdAt, updatedAt, lastSignedIn
```

---

## 📊 Resumo de Validação

| Teste | Status | Observações |
|-------|--------|-------------|
| Variáveis de Ambiente | [ ] | Deve estar definidas e carregadas |
| Banco de Dados | [ ] | 15 tabelas criadas, 5 planos inseridos |
| Servidor Backend | [ ] | Rodando em http://localhost:3000 |
| Frontend | [ ] | Sem erro "Invalid URL" |
| Scripts Separados | [ ] | dev-server.bat e dev-client.bat funcionando |
| Seed de Dados | [ ] | 5 planos inseridos com sucesso |
| Migrações | [ ] | Schema completo criado |

---

## 🎯 Próximas Etapas (Após Validação)

1. **Testar Login:**
   - [ ] Clique em "Entrar com Manus"
   - [ ] Complete o login com sua conta Manus
   - [ ] Verifique se redirecionou para o dashboard

2. **Testar Funcionalidades:**
   - [ ] Vya Cloud: Upload de arquivo
   - [ ] Vya Email: Criar conta de email
   - [ ] Vya Hosting: Criar site
   - [ ] Planos: Visualizar e selecionar plano

3. **Testar Pagamentos:**
   - [ ] Clique em "Assinar Plano"
   - [ ] Verifique se Stripe Checkout abre
   - [ ] Use cartão de teste: `4242 4242 4242 4242`

4. **Testar Admin:**
   - [ ] Acesse `/admin` (se tiver permissão)
   - [ ] Verifique dashboard financeiro
   - [ ] Verifique gerenciamento de afiliados

---

## 🚨 Problemas Comuns

| Erro | Solução |
|------|---------|
| "Invalid URL" no navegador | Verifique `.env` na raiz, reinicie servidor |
| "ECONNREFUSED 127.0.0.1:3306" | Verifique se MySQL está rodando |
| "Port 3000 already in use" | Mude porta: `$env:PORT="3001"` |
| "Cannot find module 'mysql2'" | Execute: `pnpm install` |
| "Unknown database 'vya_nexus'" | Execute: `pnpm db:push` |
| "script not found: db:seed" | Execute: `node seed.mjs` |

---

**Última atualização:** 30 de Janeiro de 2026
