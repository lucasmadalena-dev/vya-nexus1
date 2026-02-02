# Vya Nexus - Guia Completo de Troubleshooting no Windows

## 🚨 Erro: "Invalid URL" no Navegador

### Sintomas
- Tela branca com triângulo vermelho (ErrorBoundary)
- Console do navegador mostra: `TypeError: Failed to construct 'URL': Invalid URL at getLoginUrl`

### Causa Raiz
As variáveis de ambiente `VITE_*` não estão sendo lidas pelo Vite no frontend.

### ✅ Solução

#### **Passo 1: Verificar se `.env` está na raiz do projeto**

```
vya-nexus/
├── .env                    ← DEVE estar aqui
├── package.json
├── client/
├── server/
├── drizzle/
└── ...
```

**Não coloque em:**
- ❌ `client/.env`
- ❌ `server/.env`
- ❌ Subpastas

#### **Passo 2: Verificar conteúdo do `.env`**

O arquivo `.env` deve conter **obrigatoriamente**:

```env
VITE_APP_ID=seu_app_id_aqui
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_key_aqui
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=sua_chave_secreta_super_segura
```

#### **Passo 3: Verificar se as variáveis foram carregadas**

1. Abra o navegador em `http://localhost:3000`
2. Abra o Console (F12 ou Ctrl+Shift+I)
3. Digite:

```javascript
console.log(import.meta.env.VITE_APP_ID)
console.log(import.meta.env.VITE_OAUTH_PORTAL_URL)
```

**Se retornar `undefined`:**
- Verifique se o `.env` está na **raiz** do projeto
- Reinicie o servidor: `pnpm dev`
- Limpe o cache do navegador: `Ctrl+Shift+Delete`

**Se retornar o valor:**
- As variáveis estão carregadas corretamente
- O erro pode estar em outro lugar

#### **Passo 4: Reiniciar o servidor**

```powershell
# Parar o servidor (Ctrl+C no terminal)
# Limpar cache
pnpm install

# Reiniciar
pnpm dev
```

---

## 🔧 Erro: "pnpm: command not found"

### Solução

```powershell
# Instalar pnpm globalmente
npm install -g pnpm@10.4.1

# Verificar instalação
pnpm --version
```

---

## 🔧 Erro: "Port 3000 already in use"

### Solução 1: Matar processo na porta 3000

```powershell
# Encontrar processo
netstat -ano | findstr :3000

# Resultado exemplo: TCP    127.0.0.1:3000    0.0.0.0:0    LISTENING    12345

# Matar o processo (substitua 12345 pelo PID)
taskkill /PID 12345 /F
```

### Solução 2: Usar porta diferente

```powershell
$env:PORT="3001"
pnpm dev
```

---

## 🔧 Erro: "ECONNREFUSED 127.0.0.1:3306"

### Sintomas
- Servidor não consegue conectar ao MySQL
- Erro: `connect ECONNREFUSED 127.0.0.1:3306`

### Solução 1: Verificar se MySQL está rodando

```powershell
# Abrir Services (Win+R, digitar "services.msc")
# Procurar por "MySQL80" ou similar
# Se estiver parado, clique em "Start"

# Ou via PowerShell (como Admin):
Get-Service MySQL80 | Start-Service
```

### Solução 2: Verificar DATABASE_URL

```env
# Formato correto:
DATABASE_URL=mysql://usuario:senha@localhost:3306/banco

# Exemplos:
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
DATABASE_URL=mysql://root:@localhost:3306/vya_nexus  # sem senha
```

### Solução 3: Testar conexão MySQL

```powershell
# Instalar MySQL CLI (se não tiver)
# Download: https://dev.mysql.com/downloads/mysql/

# Testar conexão
mysql -u root -p -h localhost

# Se funcionar, você verá o prompt: mysql>
# Digite: exit
```

---

## 🔧 Erro: "Unknown database 'vya_nexus'"

### Solução

```powershell
# Conectar ao MySQL
mysql -u root -p

# Dentro do MySQL:
CREATE DATABASE vya_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Depois rodar migrações
pnpm db:push
```

---

## 🔧 Erro: "Cannot find module 'mysql2'"

### Solução

```powershell
# Reinstalar dependências
pnpm install

# Rodar migrações
pnpm db:push
```

---

## 🔧 Erro: "script not found: db:seed"

### Solução

O script `db:seed` foi adicionado ao `package.json`. Se ainda não funcionar:

```powershell
# Verificar se o arquivo seed.mjs existe
dir seed.mjs

# Se não existir, crie-o (veja WINDOWS_ENV_SETUP.md)

# Executar seed manualmente
node seed.mjs

# Ou via pnpm
pnpm db:seed
```

---

## 🚀 Como Rodar Client e Server Separadamente

### Opção 1: Usar Scripts Batch (Mais Fácil)

#### **Terminal 1 - Servidor:**
```powershell
.\dev-server.bat
```

#### **Terminal 2 - Cliente:**
```powershell
.\dev-client.bat
```

### Opção 2: Usar Script PowerShell

```powershell
# Permitir execução de scripts (uma vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Executar script
.\dev-separate.ps1
```

### Opção 3: Manualmente via pnpm

#### **Terminal 1 - Servidor:**
```powershell
$env:NODE_ENV="development"
$env:PORT="3000"
pnpm run dev:server
```

#### **Terminal 2 - Cliente:**
```powershell
$env:NODE_ENV="development"
pnpm run dev:client
```

---

## 📋 Checklist de Configuração Completa

- [ ] Node.js v20+ instalado (`node --version`)
- [ ] pnpm instalado (`pnpm --version`)
- [ ] MySQL rodando (`mysql -u root -p`)
- [ ] Banco `vya_nexus` criado
- [ ] Arquivo `.env` na raiz do projeto
- [ ] `.env` contém `VITE_APP_ID` e `VITE_OAUTH_PORTAL_URL`
- [ ] `.env` contém `DATABASE_URL` correto
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Migrações rodadas (`pnpm db:push`)
- [ ] Dados iniciais populados (`pnpm db:seed`)
- [ ] Servidor inicia sem erros (`pnpm dev`)
- [ ] Cliente carrega sem erro "Invalid URL"

---

## 🎯 Próximas Etapas

Após resolver todos os erros:

1. **Abra http://localhost:3000 no navegador**
2. **Clique em "Entrar com Manus"**
3. **Complete o onboarding**
4. **Teste as funcionalidades:**
   - Vya Cloud (upload de arquivos)
   - Vya Email (criar contas de email)
   - Vya Hosting (criar sites)
   - Planos e pagamentos

---

## 📞 Ainda Não Funcionou?

Se nenhuma solução acima funcionou:

1. **Compartilhe o erro completo** (copie do console do navegador ou terminal)
2. **Verifique o arquivo `.env`** (sem compartilhar chaves secretas)
3. **Verifique se MySQL está rodando** (`netstat -ano | findstr :3306`)
4. **Tente limpar tudo e começar do zero:**

```powershell
# Parar servidor (Ctrl+C)
# Remover cache
Remove-Item -Recurse -Force node_modules
Remove-Item -Force pnpm-lock.yaml

# Reinstalar
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

---

**Última atualização:** 30 de Janeiro de 2026
