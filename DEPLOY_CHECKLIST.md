# Vya Nexus - Deploy Checklist

## 📋 Pré-requisitos

Antes de iniciar o deployment, certifique-se de que você tem:

- [ ] Acesso SSH ao servidor de produção
- [ ] Domínio `vyaconcept.com.br` configurado no Registro.br
- [ ] Registros DNS A criados para os 5 subdomínios (nexus, admin-nexus, cloud, email, hosting)
- [ ] Certificado SSL Let's Encrypt gerado ou pronto para gerar
- [ ] Banco de dados MySQL/TiDB configurado e acessível
- [ ] Variáveis de ambiente (.env) preparadas
- [ ] Chaves Stripe (Secret Key, Publishable Key, Webhook Secret)
- [ ] Credenciais AWS S3 para storage

---

## 🚀 Passo 1: Preparar o Servidor

### 1.1 Atualizar Sistema
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 1.2 Instalar Dependências
```bash
sudo apt-get install -y curl git nodejs npm nginx certbot python3-certbot-nginx
```

### 1.3 Instalar PM2 Globalmente
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

### 1.4 Clonar Repositório
```bash
cd /opt
sudo git clone <seu-repositorio-vya-nexus> vya-nexus
cd vya-nexus
sudo chown -R $USER:$USER .
```

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar Arquivo .env
```bash
cd /opt/vya-nexus
nano .env
```

### 2.2 Adicionar Variáveis (Exemplo)
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/vya_nexus

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# Stripe
STRIPE_SECRET_KEY=sk_test_seu_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# AWS S3
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=seu_secret_key
AWS_S3_BUCKET=seu_bucket_name
AWS_S3_REGION=us-east-1

# Domínio
VITE_APP_TITLE=Vya Nexus
VITE_APP_LOGO=/logo.svg

# Servidor
NODE_ENV=production
PORT=3000
```

### 2.3 Salvar Arquivo
```bash
# Ctrl+O para salvar
# Ctrl+X para sair
```

---

## 📦 Passo 3: Instalar Dependências e Build

### 3.1 Instalar Dependências
```bash
cd /opt/vya-nexus
npm install
# ou
pnpm install
```

### 3.2 Executar Migrações do Banco
```bash
pnpm db:push
```

### 3.3 Build da Aplicação
```bash
npm run build
# ou
pnpm build
```

---

## 🔐 Passo 4: Configurar SSL com Let's Encrypt

### 4.1 Gerar Certificados
```bash
sudo certbot certonly --standalone \
  -d nexus.vyaconcept.com.br \
  -d admin-nexus.vyaconcept.com.br \
  -d cloud.vyaconcept.com.br \
  -d email.vyaconcept.com.br \
  -d hosting.vyaconcept.com.br \
  --email seu_email@vyaconcept.com.br \
  --agree-tos \
  --non-interactive
```

### 4.2 Verificar Certificados
```bash
sudo ls -la /etc/letsencrypt/live/nexus.vyaconcept.com.br/
```

### 4.3 Configurar Renovação Automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## ⚙️ Passo 5: Configurar Nginx

### 5.1 Copiar Arquivo de Configuração
```bash
sudo cp /opt/vya-nexus/nginx/vya-nexus.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vya-nexus.conf /etc/nginx/sites-enabled/
```

### 5.2 Desabilitar Site Padrão
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5.3 Testar Configuração Nginx
```bash
sudo nginx -t
```

### 5.4 Iniciar Nginx
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5.5 Verificar Status
```bash
sudo systemctl status nginx
```

---

## 🎯 Passo 6: Iniciar Aplicação com PM2

### 6.1 Copiar Arquivo de Configuração PM2
```bash
cp /opt/vya-nexus/ecosystem.config.js /opt/vya-nexus/
```

### 6.2 Iniciar Processos
```bash
cd /opt/vya-nexus
pm2 start ecosystem.config.js
```

### 6.3 Salvar Configuração PM2
```bash
pm2 save
pm2 startup
```

### 6.4 Verificar Status
```bash
pm2 status
pm2 logs
```

---

## 🧪 Passo 7: Testar Deployment

### 7.1 Verificar Acesso aos Subdomínios
```bash
# Testar cada subdomínio
curl -I https://nexus.vyaconcept.com.br
curl -I https://admin-nexus.vyaconcept.com.br
curl -I https://cloud.vyaconcept.com.br
curl -I https://email.vyaconcept.com.br
curl -I https://hosting.vyaconcept.com.br
```

### 7.2 Verificar Certificados SSL
```bash
# Todos devem retornar "HTTP/2 200" ou "HTTP/1.1 200"
```

### 7.3 Testar API
```bash
curl -X GET https://nexus.vyaconcept.com.br/api/trpc/auth.me
```

### 7.4 Verificar Logs
```bash
pm2 logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 🔄 Passo 8: Configurar Webhooks Stripe

### 8.1 Obter URL do Webhook
```
https://admin-nexus.vyaconcept.com.br/api/webhooks/stripe
```

### 8.2 Configurar no Dashboard Stripe
1. Acesse https://dashboard.stripe.com
2. Vá para "Developers" → "Webhooks"
3. Clique em "Add endpoint"
4. Cole a URL acima
5. Selecione eventos: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
6. Copie o "Signing Secret" e adicione ao `.env` como `STRIPE_WEBHOOK_SECRET`

### 8.3 Reiniciar Aplicação
```bash
pm2 restart all
```

---

## 📊 Passo 9: Monitoramento e Manutenção

### 9.1 Verificar Saúde da Aplicação
```bash
# Verificar se PM2 está rodando
pm2 status

# Verificar se Nginx está rodando
sudo systemctl status nginx

# Verificar conexão com banco de dados
mysql -h localhost -u user -p -e "SELECT 1;"
```

### 9.2 Visualizar Logs
```bash
# Logs da aplicação
pm2 logs

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
```

### 9.3 Configurar Monitoramento PM2
```bash
# Instalar PM2 Plus (opcional)
pm2 plus

# Monitorar recursos
pm2 monit
```

---

## 🛡️ Passo 10: Segurança

### 10.1 Configurar Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 10.2 Configurar Fail2Ban (Proteção contra Brute Force)
```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.3 Configurar Rate Limiting no Nginx
```bash
# Já configurado em /etc/nginx/nginx.conf
# Limita a 10 requisições por segundo por IP
```

---

## 📝 Passo 11: Backup e Recuperação

### 11.1 Backup do Banco de Dados
```bash
# Backup diário
sudo crontab -e

# Adicionar linha:
# 0 2 * * * mysqldump -u user -p password vya_nexus > /backups/vya_nexus_$(date +\%Y\%m\%d).sql
```

### 11.2 Backup de Arquivos
```bash
# Backup semanal
# 0 3 * * 0 tar -czf /backups/vya_nexus_$(date +\%Y\%m\%d).tar.gz /opt/vya_nexus
```

---

## ✅ Checklist Final

Antes de considerar o deploy concluído:

- [ ] Todos os 5 subdomínios estão acessíveis
- [ ] SSL/TLS está funcionando em todos os subdomínios
- [ ] PM2 está gerenciando 5 processos (um por subdomínio)
- [ ] Nginx está roteando corretamente para cada subdomínio
- [ ] Banco de dados está conectado e migrações foram executadas
- [ ] Stripe webhooks estão configurados
- [ ] S3 está funcionando para upload de arquivos
- [ ] Logs estão sendo gerados corretamente
- [ ] Firewall está ativo e permitindo apenas portas necessárias
- [ ] Backups estão configurados
- [ ] Certificado SSL será renovado automaticamente

---

## 🆘 Troubleshooting

### Problema: Nginx não inicia
```bash
sudo nginx -t  # Verificar sintaxe
sudo systemctl status nginx  # Ver erro
```

### Problema: PM2 não inicia processos
```bash
pm2 start ecosystem.config.js --no-daemon  # Executar em foreground para ver erros
```

### Problema: Certificado SSL expirado
```bash
sudo certbot renew --dry-run  # Testar renovação
sudo certbot renew  # Renovar certificados
```

### Problema: Porta 3000 já em uso
```bash
sudo lsof -i :3000  # Ver processo usando a porta
sudo kill -9 <PID>  # Matar processo
```

---

## 📞 Suporte

Para dúvidas ou problemas durante o deployment, entre em contato com o time de infraestrutura.

**Última atualização:** 30 de Janeiro de 2026
