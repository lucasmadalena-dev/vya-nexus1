# Vya Nexus - Guia de Transição: Desenvolvimento → Produção

## 📋 Visão Geral

Este documento descreve como transicionar o Vya Nexus de um ambiente de desenvolvimento 100% local para produção online.

---

## 🔄 Comparação: Desenvolvimento vs Produção

| Aspecto | Desenvolvimento | Produção |
|--------|-----------------|----------|
| **Autenticação** | `AUTH_BYPASS=true` (sem OAuth) | `AUTH_BYPASS=false` (OAuth Manus) |
| **Storage** | `USE_LOCAL_STORAGE=true` (disco local) | `USE_LOCAL_STORAGE=false` (AWS S3) |
| **Banco de Dados** | MySQL local | MySQL remoto (Manus ou externo) |
| **Pagamentos** | Stripe teste | Stripe live |
| **Email** | Não configurado | SMTP profissional |
| **URL** | `http://localhost:3000` | `https://seu-dominio.com` |
| **Certificado SSL** | Não necessário | Automático (Manus) |

---

## 🚀 Passo-a-Passo: Desenvolvimento Local

### **1. Iniciar em Desenvolvimento**

```powershell
# Copiar .env.development para .env
Copy-Item .env.development .env

# Instalar dependências
pnpm install

# Criar banco de dados
pnpm db:push

# Popular dados iniciais
pnpm db:seed

# Iniciar servidor
pnpm dev
```

**Resultado esperado:**
- ✅ Acesso em `http://localhost:3000`
- ✅ Login automático como admin_local (sem OAuth)
- ✅ Arquivos salvos em `./uploads`
- ✅ Sem necessidade de Stripe, AWS ou email

---

## 🌐 Passo-a-Passo: Transição para Produção

### **Passo 1: Preparar Credenciais (1-2 horas)**

Você precisa de:

#### **1.1 Banco de Dados**
- [ ] Banco MySQL remoto (Manus fornece ou use seu próprio)
- [ ] Usuário e senha do banco
- [ ] Host e porta

#### **1.2 Stripe**
- [ ] Conta Stripe criada
- [ ] Chaves LIVE (`sk_live_...` e `pk_live_...`)
- [ ] Produtos criados (5 planos)
- [ ] Webhook configurado

#### **1.3 AWS S3**
- [ ] Conta AWS criada
- [ ] Access Key ID e Secret Access Key
- [ ] Bucket criado
- [ ] Região configurada

#### **1.4 Email SMTP**
- [ ] Provedor de email escolhido (SendGrid, AWS SES, etc)
- [ ] Host SMTP
- [ ] Usuário e senha

#### **1.5 Manus OAuth**
- [ ] App registrado no Manus para produção
- [ ] Redirect URI configurado: `https://seu-dominio.com/api/oauth/callback`
- [ ] Chaves de API Manus

#### **1.6 Domínio**
- [ ] Domínio comprado
- [ ] DNS apontando para Manus

---

### **Passo 2: Criar Arquivo .env.production**

```powershell
# Copiar template
Copy-Item .env.production.template .env.production

# Abrir e preencher todos os valores
notepad .env.production
```

**Valores a preencher:**

```env
# Banco de dados
DATABASE_URL=mysql://usuario:senha@host:3306/vya_nexus_prod

# Stripe (chaves LIVE)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Email
SMTP_HOST=smtp.seu_provedor.com
SMTP_USER=seu_email@seu_dominio.com
SMTP_PASSWORD=...

# Manus OAuth
VITE_APP_ID=vya-nexus-prod
OWNER_OPEN_ID=seu_owner_id

# JWT
JWT_SECRET=sua_chave_super_segura_com_32_caracteres
```

---

### **Passo 3: Testar em Produção Local**

Simular ambiente de produção antes de fazer deploy:

```powershell
# Definir variáveis de ambiente
$env:NODE_ENV="production"
$env:AUTH_BYPASS="false"
$env:USE_LOCAL_STORAGE="false"

# Build
pnpm build

# Testar build
pnpm start

# Abrir http://localhost:3000
# Testar fluxo completo:
# - Login com Manus (deve funcionar)
# - Upload de arquivo (deve ir para S3)
# - Pagamento Stripe (modo teste)
```

---

### **Passo 4: Fazer Deploy**

1. **Commitar mudanças:**
   ```powershell
   git add .
   git commit -m "Deploy: Vya Nexus v1.0 - Pronto para produção"
   git push origin main
   ```

2. **No Management UI do Manus:**
   - Clique em **Publish**
   - Selecione o checkpoint
   - Clique em **Deploy**

3. **Configurar Domínio:**
   - Vá para **Settings** → **Domains**
   - Adicione seu domínio customizado
   - Configure DNS

---

### **Passo 5: Validar Deploy**

```
1. Abrir https://seu-dominio.com
2. Clicar em "Entrar com Manus"
3. Fazer login com sua conta Manus
4. Testar upload de arquivo
5. Testar pagamento (usar cartão de teste Stripe)
6. Verificar logs (Settings → Logs)
```

---

## 🔑 Variáveis Críticas

### **Desenvolvimento**

```env
AUTH_BYPASS=true                    # Bypass de autenticação
USE_LOCAL_STORAGE=true              # Storage local
LOCAL_STORAGE_PATH=./uploads        # Pasta local
```

### **Produção**

```env
AUTH_BYPASS=false                   # OAuth obrigatório
USE_LOCAL_STORAGE=false             # AWS S3 obrigatório
AWS_S3_BUCKET=vya-nexus-prod        # Bucket S3
```

---

## ⚠️ Pontos Críticos

### **Segurança**

- [ ] **NUNCA** commite `.env.production` no Git
- [ ] **NUNCA** compartilhe chaves secretas
- [ ] Use `sk_live_` e `pk_live_` do Stripe em produção (não test)
- [ ] Altere `JWT_SECRET` para uma chave aleatória segura
- [ ] Configure SSL/TLS (Manus faz automaticamente)

### **Dados**

- [ ] Faça backup do banco de dados antes de deploy
- [ ] Teste migrações em ambiente de staging
- [ ] Verifique integridade dos dados após deploy

### **Performance**

- [ ] Configure CDN para arquivos estáticos
- [ ] Monitore logs após deploy
- [ ] Configure alertas para erros

---

## 📊 Checklist de Deploy

### **Antes de Fazer Deploy**

- [ ] Código finalizado e testado
- [ ] Banco de dados remoto configurado
- [ ] Stripe live configurado
- [ ] AWS S3 configurado
- [ ] Email SMTP configurado
- [ ] Manus OAuth configurado
- [ ] Domínio registrado
- [ ] `.env.production` preenchido
- [ ] Build local testado (`pnpm build`)
- [ ] Testes passando (`pnpm test`)

### **Após Deploy**

- [ ] Verificar se site carrega sem erros
- [ ] Testar login com Manus
- [ ] Testar upload de arquivo
- [ ] Testar pagamento Stripe
- [ ] Verificar logs
- [ ] Monitorar performance
- [ ] Configurar backups automáticos

---

## 🔧 Troubleshooting

### **Erro: "AUTH_BYPASS não está ativado"**

Você está tentando usar rotas de bypass em produção. Remova `AUTH_BYPASS=true` do `.env.production`.

### **Erro: "Local storage não está ativado"**

Você está tentando usar storage local em produção. Configure `USE_LOCAL_STORAGE=false` e `AWS_*` credenciais.

### **Erro: "Storage upload failed"**

Verifique credenciais AWS S3 e permissões do bucket.

### **Erro: "OAuth callback failed"**

Verifique se `VITE_APP_ID` está correto e se redirect URI está configurado no Manus.

---

## 📞 Próximos Passos

1. **Reunir credenciais** (Stripe, AWS, Email, Manus)
2. **Preencher `.env.production`**
3. **Testar localmente com `pnpm build`**
4. **Fazer deploy**
5. **Monitorar e otimizar**

---

**Última atualização:** 2 de Fevereiro de 2026
