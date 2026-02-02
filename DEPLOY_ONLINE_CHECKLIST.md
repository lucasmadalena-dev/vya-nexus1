# Vya Nexus - Checklist Completo para Deploy Online

## 📋 O Que Você Precisa

### **1. Credenciais e Configurações Externas**

#### **Manus OAuth**
- [ ] App ID registrado no Manus (ex: `vya-nexus-prod`)
- [ ] Redirect URI configurado: `https://seu-dominio.com/api/oauth/callback`
- [ ] Chaves de API Manus (fornecidas pelo time)

#### **Stripe (Pagamentos)**
- [ ] Conta Stripe criada (https://stripe.com)
- [ ] Chave Secreta Stripe (`sk_live_...` para produção)
- [ ] Chave Pública Stripe (`pk_live_...` para produção)
- [ ] Webhook Secret Stripe (`whsec_...`)
- [ ] Produtos criados no Stripe (5 planos)

#### **AWS S3 (Storage)**
- [ ] Conta AWS criada (https://aws.amazon.com)
- [ ] Access Key ID e Secret Access Key
- [ ] Bucket S3 criado (ex: `vya-nexus-prod`)
- [ ] Região configurada (ex: `sa-east-1`)

#### **Email (SMTP)**
- [ ] Provedor de email escolhido (SendGrid, AWS SES, etc)
- [ ] Host SMTP
- [ ] Porta SMTP (587 ou 465)
- [ ] Usuário/Email
- [ ] Senha ou API Key

#### **Domínio**
- [ ] Domínio comprado (ex: `vyaconcept.com.br`)
- [ ] DNS configurado para apontar para Manus
- [ ] SSL/TLS automático (Manus fornece)

---

### **2. Código e Banco de Dados**

#### **Código**
- [ ] Projeto sincronizado no GitHub
- [ ] Todas as correções Windows commitadas
- [ ] `.env.example` atualizado (sem valores sensíveis)
- [ ] `.gitignore` inclui `.env`

#### **Banco de Dados**
- [ ] Schema Drizzle finalizado (`drizzle/schema.ts`)
- [ ] Migrações testadas (`pnpm db:push`)
- [ ] Seed de dados criado (`seed.mjs`)
- [ ] 5 planos inseridos no banco

#### **Frontend**
- [ ] UI/UX finalizada
- [ ] Todas as páginas funcionando
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Testes passando (`pnpm test`)

#### **Backend**
- [ ] Todas as rotas tRPC implementadas
- [ ] Validações de dados
- [ ] Tratamento de erros
- [ ] Logs configurados

---

### **3. Documentação**

- [ ] README.md atualizado
- [ ] DEPLOYMENT.md criado
- [ ] ENV_VARIABLES_REFERENCE.md completo
- [ ] Guia de troubleshooting

---

## 🚀 Passo-a-Passo para Deploy

### **Passo 1: Preparar Credenciais (1-2 horas)**

```
1. Criar conta Stripe
   → Gerar chaves sk_live_ e pk_live_
   → Criar 5 produtos (planos)
   → Configurar webhooks

2. Criar conta AWS
   → Criar bucket S3
   → Gerar Access Key ID e Secret
   → Configurar CORS

3. Configurar Email
   → Escolher provedor (SendGrid, SES, etc)
   → Gerar credenciais SMTP

4. Registrar App no Manus
   → Criar novo app com domínio final
   → Configurar redirect URIs
   → Obter chaves de API
```

### **Passo 2: Atualizar Variáveis de Ambiente (30 min)**

Criar arquivo `.env` de produção com:

```env
# Produção
NODE_ENV=production
PORT=3000

# Domínio
VITE_FRONTEND_URL=https://seu-dominio.com
VITE_APP_TITLE=Vya Nexus

# OAuth Manus (produção)
VITE_APP_ID=vya-nexus-prod
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=Herbert

# Stripe (produção)
STRIPE_SECRET_KEY=sk_live_seu_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_seu_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET=vya-nexus-prod
AWS_S3_REGION=sa-east-1

# Email
SMTP_HOST=smtp.seu_provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@seu_dominio.com
SMTP_PASSWORD=sua_senha_smtp
SMTP_FROM=noreply@seu_dominio.com

# Banco de Dados (fornecido por Manus)
DATABASE_URL=mysql://usuario:senha@host:3306/vya_nexus_prod

# JWT
JWT_SECRET=sua_chave_jwt_super_segura_com_32_caracteres_minimo

# APIs Manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key
```

### **Passo 3: Testar Tudo Localmente (30 min)**

```powershell
# Simular ambiente de produção
$env:NODE_ENV="production"
$env:VITE_FRONTEND_URL="https://seu-dominio.com"

# Build
pnpm build

# Testar build
pnpm start

# Abrir http://localhost:3000
# Testar fluxo completo:
# - Login com Manus
# - Upload de arquivo
# - Criar conta de email
# - Selecionar plano
# - Fazer pagamento (teste Stripe)
```

### **Passo 4: Deploy no Manus (5 min)**

1. **Criar checkpoint final:**
   ```powershell
   git add .
   git commit -m "Deploy: Vya Nexus v1.0 - Pronto para produção"
   git push origin main
   ```

2. **No Management UI do Manus:**
   - Clique em **Publish** (botão no canto superior direito)
   - Selecione o checkpoint
   - Clique em **Deploy**
   - Aguarde 2-5 minutos

3. **Configurar Domínio:**
   - Vá para **Settings** → **Domains**
   - Adicione seu domínio customizado
   - Configure DNS (Manus fornece instruções)

### **Passo 5: Validar Deploy (15 min)**

```
1. Abrir https://seu-dominio.com
2. Verificar se carrega sem erros
3. Testar login com Manus
4. Testar upload de arquivo
5. Testar pagamento (modo teste Stripe)
6. Verificar logs (Settings → Logs)
```

---

## ✅ Checklist Pré-Deploy

| Item | Status |
|------|--------|
| Código finalizado e commitado | [ ] |
| Banco de dados com 5 planos | [ ] |
| Stripe configurado (chaves live) | [ ] |
| AWS S3 configurado | [ ] |
| Email SMTP configurado | [ ] |
| Domínio registrado | [ ] |
| `.env` de produção criado | [ ] |
| Build local testado (`pnpm build`) | [ ] |
| Login OAuth testado | [ ] |
| Pagamento Stripe testado | [ ] |
| Upload de arquivo testado | [ ] |
| Responsivo em mobile testado | [ ] |
| Logs verificados | [ ] |
| Checkpoint criado | [ ] |

---

## 🔧 Credenciais Necessárias (Resumo)

| Serviço | O Que Precisa | Onde Obter |
|---------|--------------|-----------|
| **Stripe** | sk_live_, pk_live_, webhook secret | https://dashboard.stripe.com |
| **AWS** | Access Key, Secret Key, Bucket | https://console.aws.amazon.com |
| **Email** | SMTP Host, Port, User, Password | Seu provedor de email |
| **Manus** | App ID, Chaves de API | https://portal.manus.im |
| **Domínio** | Nome do domínio | GoDaddy, Namecheap, etc |

---

## 📞 Próximas Etapas

1. **Reunir todas as credenciais** (Stripe, AWS, Email, Manus)
2. **Atualizar `.env` de produção**
3. **Testar localmente com `pnpm build`**
4. **Criar checkpoint final**
5. **Clicar em Publish no Management UI**
6. **Configurar domínio**
7. **Validar deploy**

---

## ⚠️ Pontos Importantes

- **Nunca commite `.env`** no Git
- **Use chaves `sk_live_` e `pk_live_`** do Stripe em produção (não test)
- **Teste tudo localmente** antes de fazer deploy
- **Monitore logs** após deploy
- **Faça backup do banco** regularmente
- **Configure SSL/TLS** (Manus faz automaticamente)

---

**Pronto para começar? Vamos lá! 🚀**

Última atualização: 2 de Fevereiro de 2026
