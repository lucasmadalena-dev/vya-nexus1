# Vya Nexus - Configuração de Variáveis de Ambiente no Windows

## ⚠️ Problema Identificado

O erro **"Invalid URL"** no navegador ocorre porque as variáveis de ambiente `VITE_*` não estão sendo lidas corretamente no Windows. Isso acontece por:

1. **Arquivo `.env` não está na raiz do projeto** - Vite busca variáveis apenas em `.env` na pasta raiz
2. **Variáveis não começam com `VITE_`** - Apenas variáveis com este prefixo são injetadas no frontend
3. **Falta de validação** - Se a variável estiver vazia, `getLoginUrl()` falha ao construir a URL

---

## ✅ Solução Completa

### **Passo 1: Criar arquivo `.env` na raiz do projeto**

Na pasta raiz do `vya-nexus` (onde está `package.json`), crie um arquivo chamado `.env`:

```env
# ========== BANCO DE DADOS ==========
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus

# ========== AUTENTICAÇÃO JWT ==========
JWT_SECRET=sua_chave_secreta_jwt_super_segura_com_32_caracteres_minimo

# ========== OAUTH MANUS (OBRIGATÓRIO) ==========
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id_aqui
OWNER_NAME=Herbert

# ========== STRIPE (PAGAMENTOS) ==========
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key_aqui
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_publishable_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui

# ========== AWS S3 (STORAGE) ==========
AWS_ACCESS_KEY_ID=sua_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
AWS_S3_BUCKET=vya-nexus-storage
AWS_S3_REGION=sa-east-1

# ========== EMAIL (SMTP) ==========
SMTP_HOST=smtp.seu_provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@vyaconcept.com.br
SMTP_PASSWORD=sua_senha_smtp_aqui
SMTP_FROM=noreply@vyaconcept.com.br

# ========== MANUS BUILT-IN APIs ==========
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key_aqui

# ========== CONFIGURAÇÃO DA APLICAÇÃO ==========
NODE_ENV=development
PORT=3000
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_URL=http://localhost:3000
```

### **Passo 2: Adicionar `.env` ao `.gitignore`**

Abra o arquivo `.gitignore` na raiz do projeto e certifique-se de que contém:

```
.env
.env.local
.env.*.local
```

### **Passo 3: Reiniciar o servidor**

```bash
# Parar o servidor (Ctrl+C)
# Limpar cache
pnpm install

# Reiniciar o servidor
pnpm dev
```

---

## 🔍 Verificar se as Variáveis Foram Carregadas

### **No Console do Navegador (F12):**

```javascript
// Digite no console do navegador:
console.log(import.meta.env.VITE_APP_ID)
console.log(import.meta.env.VITE_OAUTH_PORTAL_URL)
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

Se retornar `undefined`, as variáveis não foram carregadas. Neste caso:
1. Verifique se o arquivo `.env` está na **raiz do projeto**
2. Certifique-se de que o prefixo é exatamente `VITE_`
3. Reinicie o servidor com `pnpm dev`

### **No Terminal (PowerShell):**

```powershell
# Verificar se a variável está no ambiente do Node
$env:VITE_APP_ID
$env:DATABASE_URL
```

---

## 🚀 Rodar Client e Server Separadamente no Windows

Se quiser rodar o cliente e servidor em terminais separados para evitar conflitos:

### **Terminal 1 - Backend (API/Server):**

```powershell
# Na pasta raiz do projeto
$env:NODE_ENV="development"
$env:PORT="3001"
pnpm run server
```

### **Terminal 2 - Frontend (Client/Vite):**

```powershell
# Na pasta raiz do projeto
$env:NODE_ENV="development"
$env:VITE_API_URL="http://localhost:3001"
pnpm run client
```

### **Ou usar scripts prontos:**

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch server/_core/index.ts & vite",
    "dev:server": "tsx watch server/_core/index.ts",
    "dev:client": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Depois execute:

```powershell
# Terminal 1
pnpm run dev:server

# Terminal 2
pnpm run dev:client
```

---

## 🔧 Solução de Problemas Comuns no Windows

### **Erro: "Cannot find module 'mysql2'"**

```powershell
# Solução: Reinstale dependências
pnpm install
pnpm db:push
```

### **Erro: "Port 3000 already in use"**

```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número)
taskkill /PID <PID> /F

# Ou usar porta diferente
$env:PORT="3001"
pnpm dev
```

### **Erro: "ECONNREFUSED 127.0.0.1:3306"**

```powershell
# Verificar se MySQL está rodando
# Abra Services (services.msc) e procure por "MySQL"
# Se não estiver rodando, clique em "Start"

# Ou via PowerShell (como Admin):
Start-Service MySQL80  # Substitua 80 pela sua versão
```

### **Erro: "Invalid URL" no navegador**

1. Verifique se `.env` está na **raiz do projeto** (onde está `package.json`)
2. Verifique se as variáveis começam com `VITE_`:
   - ✅ `VITE_APP_ID`
   - ✅ `VITE_OAUTH_PORTAL_URL`
   - ❌ `APP_ID` (sem prefixo)
3. Reinicie o servidor: `pnpm dev`
4. Limpe o cache do navegador: `Ctrl+Shift+Delete`

---

## 📝 Checklist de Configuração

- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] `.env` adicionado ao `.gitignore`
- [ ] `VITE_APP_ID` preenchido
- [ ] `VITE_OAUTH_PORTAL_URL` = `https://portal.manus.im`
- [ ] `OAUTH_SERVER_URL` = `https://api.manus.im`
- [ ] `DATABASE_URL` apontando para MySQL local
- [ ] `JWT_SECRET` preenchido com string aleatória
- [ ] Servidor reiniciado com `pnpm dev`
- [ ] Console do navegador mostra as variáveis corretamente

---

## 🎯 Próximo Passo

Após configurar as variáveis, execute:

```powershell
pnpm dev
```

Abra `http://localhost:3000` e verifique se o erro "Invalid URL" foi resolvido.

Se ainda houver erro, execute no console do navegador:

```javascript
console.log(import.meta.env)
```

E compartilhe o resultado para diagnóstico.

---

**Última atualização:** 30 de Janeiro de 2026
