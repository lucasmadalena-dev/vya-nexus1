# Documentação de Infraestrutura - Vya Nexus

## Visão Geral

O Vya Nexus é uma plataforma SaaS multi-tenant construída com Node.js, React e banco de dados MySQL. Esta documentação descreve a arquitetura de infraestrutura, configuração de domínios e procedimentos de deployment para produção.

## Arquitetura de Subdomínios

A plataforma utiliza uma arquitetura baseada em subdomínios para separar diferentes serviços sob o domínio principal `vyaconcept.com.br`:

| Subdomínio | Serviço | Descrição | Porta (Dev) |
|-----------|---------|-----------|------------|
| `nexus.vyaconcept.com.br` | Dashboard Principal | Painel de controle do Vya Nexus | 3000 |
| `cloud.vyaconcept.com.br` | Vya Cloud | Armazenamento em nuvem | 3001 |
| `email.vyaconcept.com.br` | Vya Email | Gerenciador de email profissional | 3002 |
| `hosting.vyaconcept.com.br` | Vya Hosting | Hospedagem de sites estáticos | 3003 |
| `admin.vyaconcept.com.br` | Painel Admin | Administração do sistema | 3004 |
| `www.vyaconcept.com.br` | Website Público | Página inicial e marketing | 3005 |
| `vyaconcept.com.br` | Domínio Raiz | Redireciona para www | 3005 |

## Configuração de Email Nativo

### Domínio Padrão

Todas as contas de email criadas no Vya Nexus utilizam o domínio `@vyaconcept.com.br` por padrão, permitindo que os usuários tenham endereços de email profissionais como:

- `contato@vyaconcept.com.br`
- `suporte@vyaconcept.com.br`
- `vendas@vyaconcept.com.br`

### Servidores de Email

| Serviço | Host | Porta | Protocolo |
|---------|------|-------|-----------|
| SMTP | `smtp.vyaconcept.com.br` | 587 | STARTTLS |
| SMTP Seguro | `smtp.vyaconcept.com.br` | 465 | SSL/TLS |
| IMAP | `imap.vyaconcept.com.br` | 993 | SSL/TLS |
| POP3 | `pop3.vyaconcept.com.br` | 995 | SSL/TLS |

### Configuração de Segurança de Email

#### SPF (Sender Policy Framework)

```
v=spf1 include:sendgrid.net include:mail.vyaconcept.com.br ~all
```

#### DKIM (DomainKeys Identified Mail)

- **Seletor:** `default`
- **Tipo:** RSA 2048-bit
- **Registro:** `default._domainkey.vyaconcept.com.br`

#### DMARC (Domain-based Message Authentication)

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@vyaconcept.com.br; ruf=mailto:dmarc@vyaconcept.com.br; fo=1
```

## Certificados SSL/TLS com Let's Encrypt

### Instalação do Certbot

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### Gerar Certificado Wildcard

```bash
# Certificado para todos os subdomínios
sudo certbot certonly --dns-route53 \
  -d vyaconcept.com.br \
  -d *.vyaconcept.com.br
```

### Renovação Automática

```bash
# Ativar timer de renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

### Localização dos Certificados

```
/etc/letsencrypt/live/vyaconcept.com.br/
├── cert.pem          # Certificado do domínio
├── chain.pem         # Cadeia de certificados
├── fullchain.pem     # Certificado + cadeia (usar em aplicações)
├── privkey.pem       # Chave privada
└── README            # Informações do certificado
```

## Configuração de DNS

Consulte o arquivo `DNS_CONFIGURATION.md` para detalhes completos sobre registros DNS necessários.

### Resumo de Registros

1. **Registros A** - Apontam subdomínios para o servidor
2. **Registros MX** - Rotear emails para servidor de mail
3. **Registros TXT** - SPF, DKIM, DMARC para segurança de email
4. **Registros CNAME** - Aliases para CDN ou serviços externos

## Deployment em Produção

### Pré-requisitos

- Servidor Linux (Ubuntu 20.04 LTS recomendado)
- Node.js 18+ e npm/pnpm
- MySQL 8.0+
- Nginx ou Apache como reverse proxy
- Certbot para Let's Encrypt

### Passos de Deployment

#### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependências
sudo apt-get install -y curl wget git nodejs npm nginx mysql-server certbot python3-certbot-nginx

# Instalar pnpm
npm install -g pnpm
```

#### 2. Clonar e Configurar Aplicação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/vya-nexus.git /var/www/vya-nexus
cd /var/www/vya-nexus

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com valores de produção
nano .env
```

#### 3. Configurar Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p << EOF
CREATE DATABASE vya_nexus;
CREATE USER 'vya_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON vya_nexus.* TO 'vya_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Executar migrações
pnpm db:push
```

#### 4. Build da Aplicação

```bash
# Build do frontend
pnpm build

# Criar arquivo de distribuição
pnpm build
```

#### 5. Configurar Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/vya-nexus

upstream vya_nexus {
    server localhost:3000;
}

upstream vya_cloud {
    server localhost:3001;
}

upstream vya_email {
    server localhost:3002;
}

upstream vya_hosting {
    server localhost:3003;
}

upstream vya_admin {
    server localhost:3004;
}

upstream vya_website {
    server localhost:3005;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name vyaconcept.com.br *.vyaconcept.com.br;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Painel Principal
server {
    listen 443 ssl http2;
    server_name nexus.vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_nexus;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Vya Cloud
server {
    listen 443 ssl http2;
    server_name cloud.vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_cloud;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Vya Email
server {
    listen 443 ssl http2;
    server_name email.vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_email;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Vya Hosting
server {
    listen 443 ssl http2;
    server_name hosting.vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_hosting;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Painel Admin
server {
    listen 443 ssl http2;
    server_name admin.vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Website Público
server {
    listen 443 ssl http2;
    server_name www.vyaconcept.com.br vyaconcept.com.br;

    ssl_certificate /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyaconcept.com.br/privkey.pem;

    location / {
        proxy_pass http://vya_website;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. Ativar Configuração Nginx

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/vya-nexus /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 7. Configurar PM2 para Gerenciamento de Processo

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'vya-nexus',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

## Monitoramento e Manutenção

### Verificar Status da Aplicação

```bash
# Verificar status PM2
pm2 status

# Ver logs
pm2 logs vya-nexus

# Monitorar recursos
pm2 monit
```

### Backup do Banco de Dados

```bash
# Backup manual
mysqldump -u vya_user -p vya_nexus > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u vya_user -p vya_nexus < backup_20240130.sql
```

### Renovação de Certificados

```bash
# Renovar certificados Let's Encrypt
sudo certbot renew

# Verificar data de expiração
openssl x509 -enddate -noout -in /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem
```

## Troubleshooting

### Certificado SSL não funciona

```bash
# Verificar certificado
openssl s_client -connect nexus.vyaconcept.com.br:443

# Renovar certificado
sudo certbot renew --force-renewal
```

### Email não está sendo entregue

```bash
# Verificar registros MX
dig vyaconcept.com.br MX

# Verificar SPF
dig vyaconcept.com.br TXT

# Testar SMTP
telnet smtp.vyaconcept.com.br 587
```

### Aplicação não inicia

```bash
# Verificar logs PM2
pm2 logs vya-nexus

# Verificar logs Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar logs do sistema
sudo journalctl -u vya-nexus -n 50
```

## Referências

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
