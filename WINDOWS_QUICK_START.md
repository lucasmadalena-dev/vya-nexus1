# Vya Nexus - Quick Start para Windows

## ⚡ Começar em 5 Minutos

### **Passo 1: Preparar Ambiente (1 min)**

```powershell
# Verificar versões
node --version      # Deve ser v20+
pnpm --version      # Deve ser 10.4.1+
mysql --version     # Deve ser 8.0+
```

### **Passo 2: Criar arquivo `.env` (1 min)**

Na raiz do projeto (onde está `package.json`), crie arquivo `.env`:

```env
DATABASE_URL=mysql://root:password@localhost:3306/vya_nexus
VITE_APP_ID=seu_app_id_aqui
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=sua_chave_secreta_super_segura_com_32_caracteres
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_key_aqui
STRIPE_SECRET_KEY=sk_test_seu_stripe_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
AWS_ACCESS_KEY_ID=sua_access_key_id
AWS_SECRET_ACCESS_KEY=sua_secret_access_key
AWS_S3_BUCKET=vya-nexus-storage
AWS_S3_REGION=sa-east-1
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=Herbert
NODE_ENV=development
PORT=3000
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_URL=http://localhost:3000
```

### **Passo 3: Instalar Dependências (2 min)**

```powershell
pnpm install
```

### **Passo 4: Configurar Banco de Dados (1 min)**

```powershell
# Rodar migrações
pnpm db:push

# Popular dados iniciais
pnpm db:seed
```

### **Passo 5: Iniciar Servidor**

```powershell
# Opção 1: Tudo junto (simples)
pnpm dev

# Opção 2: Separado (recomendado)
# Terminal 1:
.\dev-server.bat

# Terminal 2:
.\dev-client.bat
```

### **Passo 6: Abrir Navegador**

```
http://localhost:3000
```

---

## 🎯 Resultado Esperado

✅ Página carrega sem erro "Invalid URL"
✅ Botão "Entrar com Manus" visível
✅ Console do navegador limpo (sem erros)

---

## 🚨 Erro? Veja Aqui

| Erro | Solução |
|------|---------|
| "Invalid URL" | Verifique `.env` na raiz do projeto |
| "ECONNREFUSED" | MySQL não está rodando |
| "Port 3000 already in use" | Use: `$env:PORT="3001"` |
| Variáveis undefined | Reinicie servidor: `pnpm dev` |

**Mais problemas?** Veja `WINDOWS_TROUBLESHOOTING.md`

---

## 📚 Documentação Completa

- **WINDOWS_ENV_SETUP.md** - Configuração detalhada de variáveis
- **WINDOWS_TROUBLESHOOTING.md** - Solução de problemas
- **WINDOWS_VALIDATION_CHECKLIST.md** - Validar setup
- **SYSTEM_REQUIREMENTS.md** - Requisitos de sistema

---

## 🔧 Scripts Disponíveis

```powershell
pnpm dev              # Rodar tudo junto
pnpm dev:server       # Apenas servidor
pnpm dev:client       # Apenas cliente
pnpm db:push          # Rodar migrações
pnpm db:seed          # Popular dados iniciais
pnpm build            # Build para produção
pnpm test             # Rodar testes
```

---

## 📝 Checklist Rápido

- [ ] Node.js v20+ instalado
- [ ] pnpm 10.4.1+ instalado
- [ ] MySQL rodando
- [ ] `.env` criado na raiz
- [ ] `pnpm install` executado
- [ ] `pnpm db:push` executado
- [ ] `pnpm db:seed` executado
- [ ] `pnpm dev` rodando sem erros

---

**Pronto? Abra http://localhost:3000 e comece!** 🚀

---

**Última atualização:** 30 de Janeiro de 2026
