# Vya Nexus - Referência Completa de Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para executar o Vya Nexus em desenvolvimento e produção.

---

## 📋 Variáveis de Ambiente Obrigatórias

### **Banco de Dados**
```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/vya_nexus
```
- **Descrição:** URL de conexão com o banco de dados MySQL/TiDB
- **Exemplo:** `mysql://root:password123@db.example.com:3306/vya_nexus`
- **Obrigatório:** SIM

---

### **Autenticação e JWT**
```env
JWT_SECRET=vya_nexus_jwt_secret_2026_production_key_super_secure_32chars_minimum
```
- **Descrição:** Chave secreta para assinar tokens JWT
- **Comprimento recomendado:** 32+ caracteres aleatórios
- **Exemplo:** `aB3$xK9@mL2#pQ5&vW8!jH1^nF4%rT7`
- **Obrigatório:** SIM

---

### **OAuth Manus**
```env
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id
```
- **VITE_APP_ID:** ID da aplicação no Manus
- **OAUTH_SERVER_URL:** URL do servidor OAuth (padrão: https://api.manus.im)
- **VITE_OAUTH_PORTAL_URL:** URL do portal de login (padrão: https://portal.manus.im)
- **OWNER_OPEN_ID:** OpenID do proprietário/admin do sistema
- **Obrigatório:** SIM

---

### **Stripe (Pagamentos)**
```env
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key_aqui
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_publishable_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```
- **STRIPE_SECRET_KEY:** Chave secreta do Stripe (começa com `sk_`)
- **VITE_STRIPE_PUBLISHABLE_KEY:** Chave pública do Stripe (começa com `pk_`)
- **STRIPE_WEBHOOK_SECRET:** Secret para validar webhooks (começa com `whsec_`)
- **Modo Teste:** Use chaves com prefixo `test_`
- **Modo Produção:** Use chaves sem prefixo `test_`
- **Obrigatório:** SIM

---

### **AWS S3 (Storage)**
```env
AWS_ACCESS_KEY_ID=sua_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
AWS_S3_BUCKET=seu_bucket_name
AWS_S3_REGION=us-east-1
```
- **AWS_ACCESS_KEY_ID:** ID da chave de acesso AWS
- **AWS_SECRET_ACCESS_KEY:** Chave secreta de acesso AWS
- **AWS_S3_BUCKET:** Nome do bucket S3 (ex: `vya-nexus-storage`)
- **AWS_S3_REGION:** Região do bucket (ex: `us-east-1`, `sa-east-1`)
- **Obrigatório:** SIM (para funcionalidade de storage)

---

### **Email (SMTP)**
```env
SMTP_HOST=smtp.seu_provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@vyaconcept.com.br
SMTP_PASSWORD=sua_senha_smtp_aqui
SMTP_FROM=noreply@vyaconcept.com.br
```
- **SMTP_HOST:** Servidor SMTP do provedor de email
- **SMTP_PORT:** Porta SMTP (587 para TLS, 465 para SSL)
- **SMTP_USER:** Usuário/email para autenticação
- **SMTP_PASSWORD:** Senha do email
- **SMTP_FROM:** Email de origem para envios
- **Obrigatório:** SIM (para funcionalidade de email)

---

### **DKIM (Autenticação de Email)**
```env
DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...sua_chave_privada...\n-----END PRIVATE KEY-----
DKIM_PUBLIC_KEY=v=DKIM1; k=rsa; p=sua_chave_publica_aqui
```
- **DKIM_PRIVATE_KEY:** Chave privada DKIM (formato PEM)
- **DKIM_PUBLIC_KEY:** Chave pública DKIM (para registro DNS TXT)
- **Obrigatório:** NÃO (opcional, para autenticação de email avançada)

---

### **SSL/TLS (Certificados)**
```env
SSL_CERT_PATH=/etc/letsencrypt/live/nexus.vyaconcept.com.br/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/nexus.vyaconcept.com.br/privkey.pem
```
- **SSL_CERT_PATH:** Caminho para o certificado SSL (Let's Encrypt)
- **SSL_KEY_PATH:** Caminho para a chave privada SSL
- **Obrigatório:** SIM (em produção)

---

### **Stripe - IDs de Preços (Produtos)**
```env
STRIPE_STARTER_PRICE_ID=price_1Sv8ndCIKnIRVyIfrRQaG4aw
STRIPE_PROFESSIONAL_PRICE_ID=price_1Sv8neCIKnIRVyIfWjH8F9MA
STRIPE_ENTERPRISE_PRICE_ID=price_1Sv8neCIKnIRVyIfN2M9u08Q
```
- **Descrição:** IDs dos preços dos planos no Stripe
- **Como obter:** Dashboard Stripe → Products → Copiar Price ID
- **Obrigatório:** SIM

---

### **Manus Built-in APIs**
```env
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key_aqui
```
- **BUILT_IN_FORGE_API_URL:** URL da API Forge do Manus (backend)
- **BUILT_IN_FORGE_API_KEY:** Chave de API para backend
- **VITE_FRONTEND_FORGE_API_URL:** URL da API Forge (frontend)
- **VITE_FRONTEND_FORGE_API_KEY:** Chave de API para frontend
- **Obrigatório:** SIM (para integração com LLM, storage, etc)

---

### **Configuração da Aplicação**
```env
NODE_ENV=development
PORT=3000
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_URL=https://nexus.vyaconcept.com.br
```
- **NODE_ENV:** Ambiente (`development`, `production`)
- **PORT:** Porta do servidor (padrão: 3000)
- **VITE_APP_TITLE:** Título da aplicação
- **VITE_APP_LOGO:** Caminho do logo
- **VITE_FRONTEND_URL:** URL frontend em produção
- **Obrigatório:** SIM

---

## 🔒 Segurança das Variáveis

### ⚠️ **NUNCA FAÇA ISSO:**
- ❌ Commitar arquivo `.env` no Git
- ❌ Compartilhar chaves secretas por email ou chat
- ❌ Usar as mesmas chaves em desenvolvimento e produção
- ❌ Deixar chaves visíveis em logs ou console

### ✅ **SEMPRE FAÇA ISSO:**
- ✅ Manter `.env` no `.gitignore`
- ✅ Usar chaves diferentes para teste e produção
- ✅ Rotacionar chaves regularmente
- ✅ Usar gerenciador de secrets (AWS Secrets Manager, Vault, etc)
- ✅ Proteger arquivo `.env` com permissões `600`

---

## 📝 Template Completo de .env

```env
# ========== BANCO DE DADOS ==========
DATABASE_URL=mysql://usuario:senha@localhost:3306/vya_nexus

# ========== AUTENTICAÇÃO ==========
JWT_SECRET=vya_nexus_jwt_secret_2026_production_key_super_secure_32chars_minimum

# ========== OAUTH MANUS ==========
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id

# ========== STRIPE ==========
STRIPE_SECRET_KEY=sk_test_51Sv4FnCIKnIRVyIfkHAdDWKmCObswjrnDhEeUv2GvP8tjLIu42mAQC3KFB0HK5iyYmAZ94KpHmDPrRGs6WyK9v9D00Rzj1bBZi
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Sv4FnCIKnIRVyIfemErFuOb20Zs59pBayj2fJzcgQ0mDKjgc5bRQ6TVyGKB7MCUIMYjHpx4kmFj04bfpuzn0bAP00QiBFUeDs
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
STRIPE_STARTER_PRICE_ID=price_1Sv8ndCIKnIRVyIfrRQaG4aw
STRIPE_PROFESSIONAL_PRICE_ID=price_1Sv8neCIKnIRVyIfWjH8F9MA
STRIPE_ENTERPRISE_PRICE_ID=price_1Sv8neCIKnIRVyIfN2M9u08Q

# ========== AWS S3 ==========
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=vya-nexus-production
AWS_S3_REGION=sa-east-1

# ========== EMAIL (SMTP) ==========
SMTP_HOST=smtp.seu_provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@vyaconcept.com.br
SMTP_PASSWORD=sua_senha_smtp
SMTP_FROM=noreply@vyaconcept.com.br

# ========== DKIM (Opcional) ==========
DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
DKIM_PUBLIC_KEY=v=DKIM1; k=rsa; p=...

# ========== SSL/TLS ==========
SSL_CERT_PATH=/etc/letsencrypt/live/nexus.vyaconcept.com.br/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/nexus.vyaconcept.com.br/privkey.pem

# ========== MANUS BUILT-IN APIs ==========
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_forge_api_key

# ========== CONFIGURAÇÃO DA APLICAÇÃO ==========
NODE_ENV=development
PORT=3000
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_URL=https://nexus.vyaconcept.com.br
```

---

## 🔄 Roteiro de Configuração para Amanhã

1. **Desenvolvimento (Hoje):**
   - Use chaves de teste (Stripe `test_`, AWS sandbox, etc)
   - Banco de dados local ou staging
   - Variáveis em arquivo `.env.local`

2. **Produção (Amanhã):**
   - Obtenha chaves reais de cada serviço
   - Configure banco de dados de produção
   - Use gerenciador de secrets do servidor
   - Proteja arquivo `.env` com permissões `600`

---

## 📞 Onde Obter as Chaves

| Serviço | Onde Obter | URL |
|---------|-----------|-----|
| **Stripe** | Dashboard Stripe | https://dashboard.stripe.com/apikeys |
| **AWS S3** | AWS IAM Console | https://console.aws.amazon.com/iam |
| **Manus OAuth** | Manus Dashboard | https://manus.im/dashboard |
| **SMTP** | Provedor de Email | Varia por provedor |
| **Let's Encrypt** | Certbot (automático) | `sudo certbot certonly --standalone` |

---

**Última atualização:** 30 de Janeiro de 2026
