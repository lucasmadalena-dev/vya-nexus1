# Vya Nexus - Guia Passo-a-Passo para Windows (10 Minutos)

## ⚡ Solução Rápida do Erro "Invalid URL"

### **Passo 1: Abrir a Pasta do Projeto (1 min)**

1. Extraia o ZIP que você baixou
2. Abra a pasta `vya-nexus1` no **Windows Explorer**
3. Você deve ver estes arquivos/pastas:
   - `package.json`
   - `client/`
   - `server/`
   - `drizzle/`
   - `seed.mjs` ← Este arquivo DEVE estar aqui na raiz

**Se `seed.mjs` não estiver:**
- Vá para a seção "Criar seed.mjs Manualmente" abaixo

---

### **Passo 2: Criar o Arquivo `.env` (2 min)**

1. **Abra o Bloco de Notas** (Notepad)
2. **Cole este conteúdo:**

```env
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id_aqui
OWNER_NAME=Herbert
JWT_SECRET=sua_chave_secreta_super_segura_com_32_caracteres_minimo
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key_aqui
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_publishable_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
AWS_ACCESS_KEY_ID=sua_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
AWS_S3_BUCKET=vya-nexus-storage
AWS_S3_REGION=sa-east-1
SMTP_HOST=smtp.seu_provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@vyaconcept.com.br
SMTP_PASSWORD=sua_senha_smtp_aqui
SMTP_FROM=noreply@vyaconcept.com.br
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key_aqui
NODE_ENV=development
PORT=3000
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_URL=http://localhost:3000
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id_aqui
```

3. **Salve como `.env`** (importante: sem extensão .txt):
   - Clique em **Arquivo** → **Salvar Como**
   - Nome do arquivo: `.env`
   - Tipo: **Todos os arquivos**
   - Pasta: **Raiz do projeto** (mesma pasta do `package.json`)
   - Clique em **Salvar**

**Resultado esperado:**
```
vya-nexus1/
├── .env              ← Novo arquivo criado
├── package.json
├── seed.mjs
├── client/
└── ...
```

---

### **Passo 3: Abrir PowerShell (1 min)**

1. **Clique com botão direito** na pasta `vya-nexus1`
2. Selecione **"Abrir no Terminal"** ou **"Open PowerShell here"**
3. Você deve ver algo como:
   ```
   PS C:\Users\seu_usuario\vya-nexus1>
   ```

---

### **Passo 4: Instalar Dependências (2 min)**

No PowerShell, digite:

```powershell
pnpm install
```

**Resultado esperado:**
```
added 500+ packages in 2m
```

---

### **Passo 5: Criar Banco de Dados (1 min)**

No PowerShell, digite:

```powershell
pnpm db:push
```

**Resultado esperado:**
```
✔ Drizzle generated migrations
✔ Migrations applied successfully
```

---

### **Passo 6: Popular Dados Iniciais (1 min)**

No PowerShell, digite:

```powershell
node seed.mjs
```

**Resultado esperado:**
```
🔗 Conectando ao banco de dados: localhost:3306/vya_nexus
✅ Conectado ao banco de dados

📋 Inserindo planos comerciais...
  ✓ Vya Solo - R$ 29.90
  ✓ Starter 5 - R$ 99.90
  ✓ Starter 10 - R$ 189.90
  ✓ Vya Pro - R$ 199.90
  ✓ Standard 1TB - R$ 149.90

✅ Seed concluído com sucesso!
```

---

### **Passo 7: Iniciar o Servidor (1 min)**

No PowerShell, digite:

```powershell
pnpm dev
```

**Resultado esperado:**
```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

---

### **Passo 8: Abrir no Navegador (1 min)**

1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Digite na barra de endereço:**
   ```
   http://localhost:3000
   ```

3. **Verifique:**
   - ✅ Página carrega SEM erro "Invalid URL"
   - ✅ Vê o botão "Entrar com Manus"
   - ✅ Console (F12) está limpo (sem erros)

---

## 🆘 Problemas Comuns

### **Erro: "pnpm: command not found"**

```powershell
# Instale pnpm
npm install -g pnpm@10.4.1

# Verifique
pnpm --version
```

---

### **Erro: "ECONNREFUSED 127.0.0.1:3306"**

Significa que MySQL não está rodando.

**Solução:**
1. Abra **Services** (Win+R, digite `services.msc`)
2. Procure por **"MySQL80"** ou **"MySQL"**
3. Se estiver parado, clique com botão direito → **Start**

---

### **Erro: "Port 3000 already in use"**

```powershell
# Mude a porta
$env:PORT="3001"
pnpm dev

# Depois acesse http://localhost:3001
```

---

### **Erro: "Cannot find module 'mysql2'"**

```powershell
# Reinstale
pnpm install
pnpm db:push
```

---

### **Erro: "seed.mjs not found"**

Se o arquivo `seed.mjs` não estiver na raiz, vá para a seção abaixo.

---

## 📝 Criar seed.mjs Manualmente

Se o arquivo `seed.mjs` não estiver na pasta:

1. **Abra o Bloco de Notas**
2. **Cole o código abaixo** (veja no arquivo anterior)
3. **Salve como `seed.mjs`** na raiz do projeto
4. **Execute:** `node seed.mjs`

---

## ✅ Checklist Final

- [ ] Pasta `vya-nexus1` extraída
- [ ] Arquivo `.env` criado na raiz
- [ ] PowerShell aberto na pasta do projeto
- [ ] `pnpm install` executado
- [ ] `pnpm db:push` executado
- [ ] `node seed.mjs` executado com sucesso
- [ ] `pnpm dev` rodando sem erros
- [ ] http://localhost:3000 abre sem erro "Invalid URL"

---

## 🎉 Pronto!

Se tudo funcionou, você verá:
- Página inicial do Vya Nexus
- Botão "Entrar com Manus"
- Console do navegador limpo
- 5 planos no banco de dados

**Próximo passo:** Clique em "Entrar com Manus" e complete o onboarding!

---

**Última atualização:** 2 de Fevereiro de 2026
