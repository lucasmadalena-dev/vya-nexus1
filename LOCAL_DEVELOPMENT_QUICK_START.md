# Vya Nexus - Quick Start para Desenvolvimento Local (5 Minutos)

## ⚡ Começar Agora

### **Passo 1: Preparar Arquivo .env (1 min)**

```powershell
# Copiar arquivo de desenvolvimento
Copy-Item .env.development .env
```

**Ou manualmente:** Crie arquivo `.env` na raiz com:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
AUTH_BYPASS=true
ADMIN_LOCAL_OPEN_ID=admin_local
JWT_SECRET=dev_secret_key_super_segura_com_32_caracteres_minimo
USE_LOCAL_STORAGE=true
LOCAL_STORAGE_PATH=./uploads
VITE_APP_ID=vya-nexus-local
VITE_APP_TITLE=Vya Nexus (Local)
```

### **Passo 2: Instalar e Configurar (2 min)**

```powershell
# Instalar dependências
pnpm install

# Criar banco de dados
pnpm db:push

# Popular dados iniciais
pnpm db:seed
```

### **Passo 3: Iniciar Servidor (1 min)**

```powershell
pnpm dev
```

**Resultado esperado:**
```
Server running on http://localhost:3000/
```

### **Passo 4: Abrir Navegador (1 min)**

```
http://localhost:3000
```

**Você deve ver:**
- ✅ Página inicial do Vya Nexus
- ✅ Botão "Ir para Dashboard" (sem login necessário)
- ✅ Dashboard com acesso total como admin_local

---

## 🎯 O Que Funciona em Desenvolvimento

✅ **Login automático** - Sem necessidade de OAuth
✅ **Upload de arquivos** - Salvos em `./uploads` (disco local)
✅ **Criar contas de email** - Simulado no banco de dados
✅ **Criar sites** - Simulado no banco de dados
✅ **Planos e pagamentos** - Simulado (sem Stripe real)
✅ **Admin completo** - Acesso total como admin_local

---

## ❌ O Que NÃO Funciona em Desenvolvimento

❌ **OAuth Manus** - Desativado (use AUTH_BYPASS=true)
❌ **Stripe real** - Use modo teste
❌ **AWS S3** - Usa disco local em vez disso
❌ **Email real** - Não configurado
❌ **Domínio customizado** - Apenas localhost:3000

---

## 🔍 Verificar Status

### **Variáveis de Ambiente Carregadas?**

```javascript
// No console do navegador (F12):
console.log(import.meta.env.VITE_APP_ID)
console.log(import.meta.env.AUTH_BYPASS)

// Resultado esperado: valores aparecem (não undefined)
```

### **Usuário Admin Criado?**

```powershell
# Conectar ao MySQL
mysql -u root -p vya_nexus

# Dentro do MySQL:
SELECT * FROM users WHERE openId = 'admin_local';

# Resultado esperado: 1 linha com admin_local
```

### **Arquivos Sendo Salvos Localmente?**

```powershell
# Verificar pasta de uploads
dir ./uploads

# Resultado esperado: arquivos aparecem aqui
```

---

## 🚀 Próximas Ações

### **Desenvolver Localmente**

1. Fazer mudanças no código
2. Servidor reinicia automaticamente (hot reload)
3. Abrir `http://localhost:3000` para ver mudanças

### **Testar Funcionalidades**

1. Clique em "Ir para Dashboard"
2. Teste upload de arquivo
3. Teste criar conta de email
4. Teste criar site
5. Teste selecionar plano

### **Quando Pronto para Produção**

1. Leia `DEVELOPMENT_TO_PRODUCTION.md`
2. Prepare credenciais (Stripe, AWS, Email, Manus)
3. Crie `.env.production`
4. Faça deploy

---

## 🆘 Problemas Comuns

### **Erro: "ECONNREFUSED 127.0.0.1:3306"**

MySQL não está rodando. Inicie:

```powershell
# Windows Services
Get-Service MySQL80 | Start-Service

# Ou via MySQL Shell
mysql -u root -p
```

### **Erro: "Unknown database 'vya_nexus'"**

Criar banco:

```powershell
mysql -u root -p

# Dentro do MySQL:
CREATE DATABASE vya_nexus CHARACTER SET utf8mb4;
EXIT;

# Depois:
pnpm db:push
```

### **Erro: "Port 3000 already in use"**

Usar porta diferente:

```powershell
$env:PORT="3001"
pnpm dev

# Depois abrir http://localhost:3001
```

### **Erro: "Cannot find module"**

Reinstalar dependências:

```powershell
pnpm install
pnpm db:push
pnpm dev
```

---

## 📊 Checklist Rápido

- [ ] `.env` criado com `AUTH_BYPASS=true`
- [ ] MySQL rodando
- [ ] `pnpm install` executado
- [ ] `pnpm db:push` executado
- [ ] `pnpm db:seed` executado
- [ ] `pnpm dev` rodando sem erros
- [ ] `http://localhost:3000` abre
- [ ] Dashboard acessível sem login
- [ ] Pasta `./uploads` criada

---

## 💡 Dicas

- **Hot Reload:** Mudanças no código são refletidas automaticamente
- **Banco Local:** Use `mysql` CLI para inspecionar dados
- **Uploads:** Arquivos salvos em `./uploads` (não em S3)
- **Admin Automático:** Usuário `admin_local` criado automaticamente
- **Sem OAuth:** Bypass de autenticação ativado por padrão

---

**Pronto! Você está desenvolvendo 100% localmente! 🚀**

Última atualização: 2 de Fevereiro de 2026
